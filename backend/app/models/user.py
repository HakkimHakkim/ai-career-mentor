from sqlalchemy import Column, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class User(BaseModel):
    """User model"""
    __tablename__ = "users"
    
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    profile = relationship("UserProfile", uselist=False, back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"


class UserProfile(BaseModel):
    """User profile model"""
    __tablename__ = "user_profiles"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    
    education = Column(String(255), nullable=True)
    degree = Column(String(255), nullable=True)
    college = Column(String(255), nullable=True)
    graduation_year = Column(String(4), nullable=True)
    
    profile_photo_url = Column(String(500), nullable=True)
    
    experience_level = Column(String(50), nullable=True)  # Beginner, Intermediate, Advanced
    location = Column(String(255), nullable=True)
    career_goal = Column(String(255), nullable=True)
    interests = Column(Text, nullable=True)  # JSON or comma-separated
    
    learning_hours_per_week = Column(String(50), nullable=True)
    preferred_language = Column(String(10), default="en")
    preferred_theme = Column(String(20), default="dark")
    remote_preference = Column(String(50), nullable=True)
    
    bio = Column(Text, nullable=True)
    
    profile_photo_url = Column(String(500), nullable=True)

    onboarding_completed = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="profile")
    
   