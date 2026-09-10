from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Assessment(BaseModel):
    """Assessment/Quiz model"""
    __tablename__ = "assessments"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    assessment_type = Column(String(50), nullable=False)  # career, skill, knowledge
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    total_questions = Column(Integer, nullable=True)
    questions_answered = Column(Integer, default=0)
    score = Column(Integer, nullable=True)
    
    status = Column(String(50), default="in_progress")  # in_progress, completed
    
    # Relationships
    user = relationship("User", back_populates="assessments")
    answers = relationship("AssessmentAnswer", back_populates="assessment", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Assessment(id={self.id}, type={self.assessment_type}, user={self.user_id})>"


class AssessmentQuestion(BaseModel):
    """Assessment question model"""
    __tablename__ = "assessment_questions"
    
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)  # multiple_choice, text, scale
    category = Column(String(100), nullable=True)
    
    # For multiple choice
    options = Column(Text, nullable=True)  # JSON array
    correct_answer = Column(String(255), nullable=True)
    
    order = Column(Integer, nullable=True)
    
    def __repr__(self):
        return f"<AssessmentQuestion(id={self.id}, type={self.question_type})>"


class AssessmentAnswer(BaseModel):
    """User's assessment answer"""
    __tablename__ = "assessment_answers"
    
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False)
    question_id = Column(String(36), ForeignKey("assessment_questions.id"), nullable=False)
    
    answer_text = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    
    # Relationships
    assessment = relationship("Assessment", back_populates="answers")
    
    __table_args__ = (
        ForeignKeyConstraint(['assessment_id'], ['assessments.id']),
    )