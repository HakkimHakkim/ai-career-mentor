from sqlalchemy import Column, String, Text, Integer, Float, Boolean, ForeignKey, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class UserProgress(BaseModel):
    """User overall progress tracking"""
    __tablename__ = "user_progress"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    
    overall_progress_percentage = Column(Float, default=0.0)
    
    career_match_score = Column(Float, nullable=True)
    learning_progress = Column(Float, default=0.0)
    project_completion = Column(Float, default=0.0)
    interview_readiness = Column(Float, default=0.0)
    resume_score = Column(Float, nullable=True)
    
    total_hours_learned = Column(Integer, default=0)
    courses_completed = Column(Integer, default=0)
    projects_completed = Column(Integer, default=0)
    interviews_taken = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User")
    
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id']),
    )