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

class Roadmap(BaseModel):
    """Career roadmap model"""
    __tablename__ = "roadmaps"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    career_id = Column(String(36), ForeignKey("careers.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    total_steps = Column(Integer, default=0)
    completed_steps = Column(Integer, default=0)
    overall_progress = Column(Float, default=0.0)
    
    estimated_duration_days = Column(Integer, nullable=True)
    learning_hours_per_week = Column(Integer, nullable=True)
    
    status = Column(String(50), default="active")  # active, completed, paused
    
    # Relationships
    user = relationship("User", back_populates="roadmaps")
    career = relationship("Career")
    steps = relationship("RoadmapStep", back_populates="roadmap", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Roadmap(id={self.id}, user={self.user_id}, career={self.career_id})>"


class RoadmapStep(BaseModel):
    """Individual roadmap step"""
    __tablename__ = "roadmap_steps"
    
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    order = Column(Integer, nullable=False)
    estimated_hours = Column(Integer, nullable=True)
    
    status = Column(String(50), default="pending")  # pending, in_progress, completed
    completion_percentage = Column(Float, default=0.0)
    
    resources = Column(Text, nullable=True)  # JSON array of learning resources
    
    # Relationships
    roadmap = relationship("Roadmap", back_populates="steps")
    
    __table_args__ = (
        ForeignKeyConstraint(['roadmap_id'], ['roadmaps.id']),
        ForeignKeyConstraint(['skill_id'], ['skills.id']),
    )