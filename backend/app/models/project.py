from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, ForeignKeyConstraint, Table
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

# Association table for project skills
project_skills = Table(
    'project_skills',
    BaseModel.metadata,
    Column('project_id', String(36), ForeignKey('projects.id')),
    Column('skill_id', String(36), ForeignKey('skills.id'))
)

class Project(BaseModel):
    """Project template model"""
    __tablename__ = "projects"
    
    title = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    career_id = Column(String(36), ForeignKey("careers.id"), nullable=True)
    difficulty = Column(String(50), nullable=False)  # Beginner, Intermediate, Advanced
    
    estimated_hours = Column(Integer, nullable=True)
    overview = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)  # JSON array
    deliverables = Column(Text, nullable=True)  # JSON array
    
    resources = Column(Text, nullable=True)  # JSON array of links
    tutorial_url = Column(String(500), nullable=True)
    
    # Relationships
    skills = relationship("Skill", secondary=project_skills)
    user_projects = relationship("UserProject", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Project(id={self.id}, title={self.title})>"


class UserProject(BaseModel):
    """User's project work"""
    __tablename__ = "user_projects"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    github_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    
    status = Column(String(50), default="in_progress")  # in_progress, completed, abandoned
    completion_percentage = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User")
    project = relationship("Project", back_populates="user_projects")
    
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id']),
        ForeignKeyConstraint(['project_id'], ['projects.id']),
    )