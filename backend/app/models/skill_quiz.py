from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SkillQuizSession(BaseModel):
    """A generated quiz for a user on a specific skill + difficulty"""
    __tablename__ = "skill_quiz_sessions"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(255), nullable=False)
    difficulty = Column(String(20), nullable=False, default="beginner")
    questions = Column(Text, nullable=False)  # JSON array: question, options, correct_index, explanation

    user = relationship("User")

    def __repr__(self):
        return f"<SkillQuizSession(skill={self.skill_name}, difficulty={self.difficulty})>"


class SkillQuizAttempt(BaseModel):
    """Graded result of a submitted skill quiz session"""
    __tablename__ = "skill_quiz_attempts"

    quiz_session_id = Column(String(36), ForeignKey("skill_quiz_sessions.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(255), nullable=False)
    difficulty = Column(String(20), nullable=False)
    score = Column(Float, nullable=False)  # percentage 0-100
    correct_count = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)

    user = relationship("User")
    quiz_session = relationship("SkillQuizSession")

    def __repr__(self):
        return f"<SkillQuizAttempt(skill={self.skill_name}, score={self.score})>"