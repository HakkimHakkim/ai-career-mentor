from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Notification(BaseModel):
    """Notification model"""
    __tablename__ = "notifications"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    type = Column(String(50), nullable=False)  # course_update, job_match, achievement, etc
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    related_id = Column(String(36), nullable=True)  # Job ID, Course ID, etc
    related_type = Column(String(50), nullable=True)  # job, course, achievement
    
    is_read = Column(Boolean, default=False)
    action_url = Column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    def __repr__(self):
        return f"<Notification(id={self.id}, type={self.type}, user={self.user_id})>"