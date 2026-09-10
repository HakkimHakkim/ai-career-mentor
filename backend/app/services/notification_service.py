from sqlalchemy.orm import Session
from app.models.notification import Notification
from datetime import datetime

class NotificationService:
    """Notification service"""
    
    @staticmethod
    def create_notification(
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        db: Session,
        related_id: str = None,
        related_type: str = None,
        action_url: str = None
    ) -> Notification:
        """Create notification"""
        
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            related_id=related_id,
            related_type=related_type,
            action_url=action_url
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    
    @staticmethod
    def mark_as_read(notification_id: str, db: Session) -> Notification:
        """Mark notification as read"""
        
        notification = db.query(Notification).filter(
            Notification.id == notification_id
        ).first()
        
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        
        return notification
    
    @staticmethod
    def get_unread_count(user_id: str, db: Session) -> int:
        """Get unread notification count"""
        
        count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
        
        return count
    
    # Notification templates
    
    @staticmethod
    def notify_job_match(user_id: str, job_title: str, company: str, db: Session):
        """Notify about job match"""
        return NotificationService.create_notification(
            user_id=user_id,
            notification_type="job_match",
            title="New Job Match Found",
            message=f"You matched {job_title} at {company}",
            db=db,
            related_type="job"
        )
    
    @staticmethod
    def notify_course_available(user_id: str, course_title: str, db: Session):
        """Notify about new course"""
        return NotificationService.create_notification(
            user_id=user_id,
            notification_type="course_update",
            title="New Course Available",
            message=f"Check out the new course: {course_title}",
            db=db,
            related_type="course"
        )
    
    @staticmethod
    def notify_achievement(user_id: str, achievement: str, db: Session):
        """Notify about achievement"""
        return NotificationService.create_notification(
            user_id=user_id,
            notification_type="achievement",
            title="Achievement Unlocked",
            message=f"Congratulations! You've achieved: {achievement}",
            db=db
        )