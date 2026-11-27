import hashlib
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import case, delete
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

from app.models.rate_limit import RateLimitBucket


def enforce_rate_limit(db, identity: str, limit: int, window_seconds: int):
    """Atomically count requests in the shared database (PostgreSQL/SQLite)."""
    now = datetime.utcnow()
    cutoff = now - timedelta(seconds=window_seconds)
    bucket_key = hashlib.sha256(identity.encode("utf-8")).hexdigest()
    table = RateLimitBucket.__table__
    dialect = db.get_bind().dialect.name
    insert = pg_insert if dialect == "postgresql" else sqlite_insert if dialect == "sqlite" else None
    if insert is None:
        raise RuntimeError("Distributed rate limiting requires PostgreSQL or SQLite")

    statement = insert(table).values(key=bucket_key, window_start=now, count=1)
    statement = statement.on_conflict_do_update(
        index_elements=[table.c.key],
        set_={
            "window_start": case((table.c.window_start <= cutoff, now), else_=table.c.window_start),
            "count": case((table.c.window_start <= cutoff, 1), else_=table.c.count + 1),
        },
    ).returning(table.c.count)
    count = db.execute(statement).scalar_one()
    # Bound stale bucket retention without keeping request history indefinitely.
    if now.minute == 0 and now.second < 2:
        db.execute(delete(table).where(table.c.window_start < now - timedelta(days=1)))
    db.commit()
    if count > limit:
        raise HTTPException(status_code=429, detail="Too many requests; try again later")
