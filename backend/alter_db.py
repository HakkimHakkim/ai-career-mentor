from app.db import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS career_title VARCHAR(255)'))
    conn.execute(text('ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS career_fit_score FLOAT'))
    conn.execute(text('ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS career_matched_skills TEXT'))
    conn.execute(text('ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS career_missing_skills TEXT'))
    conn.commit()

print("Columns added successfully")