from sqlalchemy import Column, DateTime, Integer, String
from app.models.base import Base


class RateLimitBucket(Base):
    """Shared, database-backed request window counter."""
    __tablename__ = "rate_limit_buckets"

    key = Column(String(64), primary_key=True)
    window_start = Column(DateTime, nullable=False, index=True)
    count = Column(Integer, nullable=False, default=0)
