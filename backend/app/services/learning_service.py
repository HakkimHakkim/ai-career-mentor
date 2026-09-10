from sqlalchemy.orm import Session
from app.models.learning import (
    LearningCourse, LearningLesson, UserCourseProgress,
    UserLessonProgress, QuizAttempt, QuizAnswer
)
from app.models.user import User
from typing import List, Dict, Tuple
from datetime import datetime

class LearningService:
    """Learning management service"""
    
    @staticmethod
    def get_all_courses(db: Session, skip: int = 0, limit: int = 20, category: str = None) -> Tuple[List[LearningCourse], int]:
        """Get courses with optional filtering"""
        query = db.query(LearningCourse)
        
        if category:
            query = query.filter(LearningCourse.category == category)
        
        total = query.count()
        courses = query.offset(skip).limit(limit).all()
        return courses, total
    
    @staticmethod
    def get_course_by_id(db: Session, course_id: str) -> LearningCourse:
        """Get course details"""
        return db.query(LearningCourse).filter(LearningCourse.id == course_id).first()
    
    @staticmethod
    def get_course_lessons(db: Session, course_id: str) -> List[LearningLesson]:
        """Get lessons for a course"""
        return db.query(LearningLesson).filter(
            LearningLesson.course_id == course_id
        ).order_by(LearningLesson.order).all()
    
    @staticmethod
    def enroll_user(db: Session, user: User, course_id: str) -> UserCourseProgress:
        """Enroll user in course"""
        course = db.query(LearningCourse).filter(LearningCourse.id == course_id).first()
        if not course:
            raise ValueError("Course not found")
        
        # Check if already enrolled
        existing = db.query(UserCourseProgress).filter(
            UserCourseProgress.user_id == user.id,
            UserCourseProgress.course_id == course_id
        ).first()
        
        if existing:
            return existing
        
        # Create enrollment
        progress = UserCourseProgress(
            user_id=user.id,
            course_id=course_id,
            total_lessons=len(course.lessons),
            status="in_progress"
        )
        
        db.add(progress)
        db.commit()
        db.refresh(progress)
        
        return progress
    
    @staticmethod
    def mark_lesson_complete(db: Session, progress_id: str, lesson_id: str) -> UserLessonProgress:
        """Mark lesson as completed"""
        
        lesson_progress = db.query(UserLessonProgress).filter(
            UserLessonProgress.course_progress_id == progress_id,
            UserLessonProgress.lesson_id == lesson_id
        ).first()
        
        if not lesson_progress:
            lesson_progress = UserLessonProgress(
                course_progress_id=progress_id,
                lesson_id=lesson_id,
                is_completed=True
            )
            db.add(lesson_progress)
        else:
            lesson_progress.is_completed = True
        
        # Update course progress
        course_progress = db.query(UserCourseProgress).filter(
            UserCourseProgress.id == progress_id
        ).first()
        
        if course_progress:
            completed = db.query(UserLessonProgress).filter(
                UserLessonProgress.course_progress_id == progress_id,
                UserLessonProgress.is_completed == True
            ).count()
            
            course_progress.lessons_completed = completed
            course_progress.progress_percentage = (completed / course_progress.total_lessons) * 100
            
            if course_progress.progress_percentage >= 100:
                course_progress.status = "completed"
        
        db.commit()
        db.refresh(lesson_progress)
        return lesson_progress
    
    @staticmethod
    def get_user_learning_progress(db: Session, user: User) -> Dict:
        """Get user's learning progress"""
        
        enrollments = db.query(UserCourseProgress).filter(
            UserCourseProgress.user_id == user.id
        ).all()
        
        if not enrollments:
            return {
                "total_progress": 0,
                "enrolled_courses": 0,
                "completed_courses": 0,
                "in_progress_courses": 0,
                "courses": []
            }
        
        total_progress = sum([e.progress_percentage for e in enrollments]) / len(enrollments)
        
        return {
            "total_progress": total_progress,
            "enrolled_courses": len(enrollments),
            "completed_courses": sum([1 for e in enrollments if e.status == "completed"]),
            "in_progress_courses": sum([1 for e in enrollments if e.status == "in_progress"]),
            "courses": [
                {
                    "course_id": e.course_id,
                    "course_name": e.course.title if e.course else "Unknown",
                    "progress": e.progress_percentage,
                    "status": e.status,
                    "lessons_completed": e.lessons_completed,
                    "total_lessons": e.total_lessons
                }
                for e in enrollments
            ]
        }
    
    @staticmethod
    def search_courses(db: Session, query: str, skip: int = 0, limit: int = 10) -> Tuple[List[LearningCourse], int]:
        """Search courses"""
        q = db.query(LearningCourse).filter(
            (LearningCourse.title.ilike(f"%{query}%")) |
            (LearningCourse.description.ilike(f"%{query}%"))
        )
        total = q.count()
        courses = q.offset(skip).limit(limit).all()
        return courses, total
    
    @staticmethod
    def get_recommended_courses(db: Session, user: User, limit: int = 5) -> List[LearningCourse]:
        """Get recommended courses based on user profile"""
        
        # Get user's career
        career_goal = user.profile.career_goal if user.profile else None
        
        if career_goal:
            # Find courses related to career
            courses = db.query(LearningCourse).filter(
                LearningCourse.category.ilike(f"%{career_goal.split()[0]}%")
            ).limit(limit).all()
        else:
            # Get popular courses
            courses = db.query(LearningCourse).limit(limit).all()
        
        return courses
    
    @staticmethod
    def get_course_statistics(db: Session, course_id: str) -> Dict:
        """Get course statistics"""
        
        course = db.query(LearningCourse).filter(LearningCourse.id == course_id).first()
        if not course:
            return {}
        
        enrollments = db.query(UserCourseProgress).filter(
            UserCourseProgress.course_id == course_id
        ).all()
        
        completed = sum([1 for e in enrollments if e.status == "completed"])
        in_progress = sum([1 for e in enrollments if e.status == "in_progress"])
        
        avg_progress = sum([e.progress_percentage for e in enrollments]) / len(enrollments) if enrollments else 0
        
        return {
            "course_id": course_id,
            "course_title": course.title,
            "total_enrollments": len(enrollments),
            "completed": completed,
            "in_progress": in_progress,
            "average_progress": avg_progress,
            "completion_rate": (completed / len(enrollments)) * 100 if enrollments else 0
        }