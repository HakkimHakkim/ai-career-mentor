from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Skill(BaseModel):
    """Skill model"""
    __tablename__ = "skills"

    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    difficulty = Column(String(50), nullable=True)

    proficiency_levels = Column(Text, nullable=True)
    learning_resources = Column(Text, nullable=True)
    related_skills = Column(Text, nullable=True)

    # Relationships
    user_skills = relationship(
        "UserSkill",
        back_populates="skill",
        cascade="all, delete-orphan"
    )

    career_skills = relationship(
        "CareerSkill",
        back_populates="skill",
        cascade="all, delete-orphan"
    )

    courses = relationship(
        "LearningCourse",
        secondary="course_skills"
    )

    def __repr__(self):
        return f"<Skill(id={self.id}, name={self.name})>"