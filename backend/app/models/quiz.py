from sqlalchemy import Column, String, Text, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Job(BaseModel):
    """Job listing"""
    __tablename__ = "jobs"

    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    remote_type = Column(String(20), nullable=True)  # remote, hybrid, on-site
    experience_level = Column(String(50), nullable=True)  # Entry, Mid, Senior
    description = Column(Text, nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)

    matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job(title={self.title}, company={self.company})>"


class JobMatch(BaseModel):
    """A job matched to a user"""
    __tablename__ = "job_matches"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False)
    match_score = Column(Float, nullable=True)

    user = relationship("User")
    job = relationship("Job", back_populates="matches")

    def __repr__(self):
        return f"<JobMatch(user={self.user_id}, job={self.job_id})>"


class JobApplication(BaseModel):
    """A user's application to a job"""
    __tablename__ = "job_applications"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=True)
    status = Column(String(50), default="applied")

    user = relationship("User")
    job = relationship("Job", back_populates="applications")

    def __repr__(self):
        return f"<JobApplication(user={self.user_id}, status={self.status})>"