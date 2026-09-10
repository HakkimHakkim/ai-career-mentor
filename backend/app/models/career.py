from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Boolean, UniqueConstraint, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Career(BaseModel):
    """Career model"""
    __tablename__ = "careers"
    
    title = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    difficulty = Column(String(50), nullable=True)  # Beginner, Intermediate, Advanced
    average_learning_time = Column(Integer, nullable=True)  # in days
    
    job_titles = Column(Text, nullable=True)  # JSON array
    tools = Column(Text, nullable=True)  # JSON array
    career_growth = Column(Text, nullable=True)
    
    # Relationships
    skills = relationship("CareerSkill", back_populates="career", cascade="all, delete-orphan")
    recommendations = relationship("CareerRecommendation", back_populates="career", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="career")
    
    def __repr__(self):
        return f"<Career(id={self.id}, title={self.title})>"





class CareerSkill(BaseModel):
    """Career-Skill relationship"""
    __tablename__ = "career_skills"
    
    career_id = Column(String(36), ForeignKey("careers.id"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)
    
    importance = Column(String(50), nullable=False)  # HIGH, MEDIUM, LOW
    required_level = Column(String(50), nullable=True)  # BEGINNER, INTERMEDIATE, ADVANCED
    category = Column(String(100), nullable=True)
    
    # Relationships
    career = relationship("Career", back_populates="skills")
    skill = relationship("Skill", back_populates="career_skills")
    
    __table_args__ = (
        UniqueConstraint('career_id', 'skill_id', name='unique_career_skill'),
    )


class UserSkill(BaseModel):
    """User skill proficiency"""
    __tablename__ = "user_skills"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)
    
    proficiency_level = Column(String(50), nullable=False)  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    years_of_experience = Column(Float, nullable=True)
    verified = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="user_skills")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'skill_id', name='unique_user_skill'),
    )


class CareerRecommendation(BaseModel):
    """Career recommendation result"""
    __tablename__ = "career_recommendations"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    career_id = Column(String(36), ForeignKey("careers.id"), nullable=False)
    
    match_score = Column(Float, nullable=False)  # 0-100
    rank = Column(Integer, nullable=True)  # 1st, 2nd, 3rd recommendation
    
    matched_skills = Column(Text, nullable=True)  # JSON array
    missing_skills = Column(Text, nullable=True)  # JSON array
    reasons = Column(Text, nullable=True)  # JSON array of reasons
    
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User")
    career = relationship("Career", back_populates="recommendations")
    
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id']),
        ForeignKeyConstraint(['career_id'], ['careers.id']),
        UniqueConstraint('user_id', 'career_id', name='unique_user_career_rec'),
    )