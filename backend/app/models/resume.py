from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Boolean, ForeignKeyConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Resume(BaseModel):
    """Uploaded resume model"""
    __tablename__ = "resumes"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False, unique=True)
    file_type = Column(String(10), nullable=False)  # pdf, docx
    file_size = Column(String(20), nullable=True)

    extracted_text = Column(Text, nullable=True)

    is_primary = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="resumes")
    analysis = relationship("ResumeAnalysis", uselist=False, back_populates="resume", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Resume(id={self.id}, user={self.user_id})>"


class ResumeAnalysis(BaseModel):
    """Resume analysis results"""
    __tablename__ = "resume_analyses"

    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=False, unique=True)

    overall_score = Column(Float, nullable=True)  # 0-100
    skill_match_score = Column(Float, nullable=True)
    keyword_score = Column(Float, nullable=True)
    projects_score = Column(Float, nullable=True)
    experience_score = Column(Float, nullable=True)

    extracted_name = Column(String(255), nullable=True)
    extracted_email = Column(String(255), nullable=True)
    extracted_phone = Column(String(20), nullable=True)

    detected_skills = Column(Text, nullable=True)  # JSON array
    missing_skills = Column(Text, nullable=True)  # JSON array
    recommendations = Column(Text, nullable=True)  # JSON array

    # Career fit fields
    career_title = Column(String(255), nullable=True)
    career_fit_score = Column(Float, nullable=True)
    career_matched_skills = Column(Text, nullable=True)  # JSON array
    career_missing_skills = Column(Text, nullable=True)  # JSON array

    # Relationships
    resume = relationship("Resume", back_populates="analysis")

    def __repr__(self):
        return f"<ResumeAnalysis(id={self.id}, score={self.overall_score})>"

    def to_dict(self):
        return {
            "id": self.id,
            "resume_id": self.resume_id,
            "overall_score": self.overall_score,
            "skill_match_score": self.skill_match_score,
            "keyword_score": self.keyword_score,
            "projects_score": self.projects_score,
            "experience_score": self.experience_score,
            "extracted_name": self.extracted_name,
            "extracted_email": self.extracted_email,
            "extracted_phone": self.extracted_phone,
            "detected_skills": self.detected_skills,
            "missing_skills": self.missing_skills,
            "recommendations": self.recommendations,
            "career_title": self.career_title,
            "career_fit_score": self.career_fit_score,
            "career_matched_skills": self.career_matched_skills,
            "career_missing_skills": self.career_missing_skills,
        }


class SkillGap(BaseModel):
    """Skill gap between user and target career"""
    __tablename__ = "skill_gaps"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    career_id = Column(String(36), ForeignKey("careers.id"), nullable=False)

    matched_skills = Column(Text, nullable=True)  # JSON array
    missing_skills = Column(Text, nullable=True)  # JSON array
    weak_skills = Column(Text, nullable=True)  # JSON array
    priority_skills = Column(Text, nullable=True)  # JSON array

    # Relationships
    user = relationship("User")
    career = relationship("Career")

    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id']),
        ForeignKeyConstraint(['career_id'], ['careers.id']),
        UniqueConstraint('user_id', 'career_id', name='unique_skill_gap'),
    )