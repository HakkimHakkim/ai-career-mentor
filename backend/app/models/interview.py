from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    ForeignKey,
    ForeignKeyConstraint,
    UniqueConstraint,
    Boolean,
    DateTime,
    Table
)
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class InterviewSession(BaseModel):
    """Interview practice session"""
    __tablename__ = "interview_sessions"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    interview_type = Column(String(50), nullable=False)  # technical, hr, behavioral, mock
    career_id = Column(String(36), ForeignKey("careers.id"), nullable=True)
    
    title = Column(String(255), nullable=True)
    difficulty = Column(String(50), nullable=True)  # Easy, Medium, Hard
    
    total_questions = Column(Integer, default=0)
    questions_answered = Column(Integer, default=0)
    
    overall_score = Column(Float, nullable=True)
    performance_feedback = Column(Text, nullable=True)
    
    status = Column(String(50), default="in_progress")  # in_progress, completed
    duration_minutes = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")
    answers = relationship("InterviewAnswer", back_populates="session", cascade="all, delete-orphan")
    
    
    def __repr__(self):
        return f"<InterviewSession(id={self.id}, type={self.interview_type})>"


class InterviewQuestion(BaseModel):
    """Interview question"""
    __tablename__ = "interview_questions"
    
    session_id = Column(String(36), ForeignKey("interview_sessions.id"), nullable=False)
    
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)  # technical, behavioral, situational
    
    model_answer = Column(Text, nullable=True)
    tips = Column(Text, nullable=True)  # JSON array
    
    order = Column(Integer, nullable=False)
    
    # Relationships
    session = relationship("InterviewSession", back_populates="questions")
    
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['interview_sessions.id']),
    )


class InterviewAnswer(BaseModel):
    """User's interview answer"""
    __tablename__ = "interview_answers"
    
    session_id = Column(String(36), ForeignKey("interview_sessions.id"), nullable=False)
    question_id = Column(String(36), ForeignKey("interview_questions.id"), nullable=False)
    
    answer_text = Column(Text, nullable=True)
    answer_audio_url = Column(String(500), nullable=True)
    
    score = Column(Float, nullable=True)  # 0-100
    feedback = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)  # JSON array
    missing_points = Column(Text, nullable=True)  # JSON array
    improvements = Column(Text, nullable=True)  # JSON array
    # Relationships
    session = relationship("InterviewSession", back_populates="answers")
    
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['interview_sessions.id']),
    )