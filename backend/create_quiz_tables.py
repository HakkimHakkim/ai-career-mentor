from app.db import engine, Base
from app.models.skill_quiz import SkillQuizSession, SkillQuizAttempt
from app.models.quiz import Job, JobMatch, JobApplication

Base.metadata.create_all(bind=engine)
print("Tables created")