from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.learning import (
    LearningCourse,
    UserCourseProgress,
    QuizAttempt
)
from app.models.roadmap import Roadmap, RoadmapStep
from app.services.roadmap_service import RoadmapService

router = APIRouter(prefix="/api/v1/learning", tags=["learning"])

@router.get("/courses")
async def list_courses(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    category: str = None
):
    """List learning courses"""
    query = db.query(LearningCourse)
    
    if category:
        query = query.filter(LearningCourse.category == category)
    
    courses = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "success": True,
        "data": courses,
        "pagination": {
            "skip": skip,
            "limit": limit,
            "total": total
        }
    }

@router.get("/courses/{course_id}")
async def get_course(
    course_id: str,
    db: Session = Depends(get_db)
):
    """Get course details"""
    course = db.query(LearningCourse).filter(LearningCourse.id == course_id).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return {
        "success": True,
        "data": course
    }

@router.get("/courses/{course_id}/lessons")
async def get_course_lessons(
    course_id: str,
    db: Session = Depends(get_db)
):
    """Get lessons for a course"""
    course = db.query(LearningCourse).filter(LearningCourse.id == course_id).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return {
        "success": True,
        "data": course.lessons
    }

@router.post("/courses/{course_id}/enroll")
async def enroll_course(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enroll in a course"""
    course = db.query(LearningCourse).filter(LearningCourse.id == course_id).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if already enrolled
    existing = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id,
        UserCourseProgress.course_id == course_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    # Create progress record
    progress = UserCourseProgress(
        user_id=current_user.id,
        course_id=course_id,
        total_lessons=len(course.lessons),
        status="in_progress"
    )
    @router.post("/courses/{course_id}/enroll")
    async def enroll_course(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
     """Enroll in a course"""

    course = db.query(LearningCourse).filter(
        LearningCourse.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    existing = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id,
        UserCourseProgress.course_id == course_id
    ).first()

    if existing:
        return {
            "success": True,
            "message": "Already enrolled",
            "data": existing.to_dict()
        }

    progress = UserCourseProgress(
        user_id=current_user.id,
        course_id=course_id,
        total_lessons=len(course.lessons),
        lessons_completed=0,
        progress_percentage=0.0,
        status="in_progress"
    )

    db.add(progress)
    db.commit()
    db.refresh(progress)

    return {
        "success": True,
        "message": "Enrolled in course successfully",
        "data": progress.to_dict()
    }

                # Update overall roadmap progress
    all_steps = db.query(RoadmapStep).filter(
                    RoadmapStep.roadmap_id == roadmap.id
                ).all()

    if all_steps:
                    roadmap.overall_progress = sum(
                        step.completion_percentage for step in all_steps
                    ) / len(all_steps)

                    roadmap.completed_steps = sum(
                        1 for step in all_steps
                        if step.status == "completed"
                    )
    
    db.add(progress)
    db.commit()
    db.refresh(progress)
    
    
    return {
        "success": True,
        "message": "Enrolled in course successfully",
        "data": progress.to_dict()
    }

@router.get("/progress")
async def get_learning_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's learning progress"""
    progress_records = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id
    ).all()
    
    total_progress = 0
    if progress_records:
        total_progress = sum([p.progress_percentage for p in progress_records]) / len(progress_records)
    
    return {
        "success": True,
        "data": {
            "total_progress": total_progress,
            "courses": progress_records,
            "total_courses": len(progress_records),
            "completed_courses": sum([1 for p in progress_records if p.status == "completed"])
        }
    }

@router.post("/lessons/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark lesson as completed"""

    from app.models.learning import LearningLesson, UserLessonProgress

    # 1. Check lesson exists
    lesson = db.query(LearningLesson).filter(
        LearningLesson.id == lesson_id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    # 2. Find user's course enrollment
    progress = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id,
        UserCourseProgress.course_id == lesson.course_id
    ).first()

    if not progress:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not enrolled in this course"
        )

    # 3. Check whether lesson is already completed
    lesson_progress = db.query(UserLessonProgress).filter(
        UserLessonProgress.course_progress_id == progress.id,
        UserLessonProgress.lesson_id == lesson_id
    ).first()

    # Already completed
    if lesson_progress and lesson_progress.is_completed:
        return {
            "success": True,
            "message": "Lesson already completed",
            "data": {
                "lesson_id": lesson_id,
                "progress_percentage": progress.progress_percentage,
                "lessons_completed": progress.lessons_completed,
                "total_lessons": progress.total_lessons,
                "status": progress.status
            }
        }

    # 4. Create lesson progress if needed
    if not lesson_progress:
        lesson_progress = UserLessonProgress(
            course_progress_id=progress.id,
            lesson_id=lesson_id,
            is_completed=True
        )
        db.add(lesson_progress)

        progress.lessons_completed += 1

    else:
        lesson_progress.is_completed = True

       # 5. Calculate course percentage
    if progress.total_lessons > 0:
        progress.progress_percentage = (
            progress.lessons_completed / progress.total_lessons
        ) * 100

    # 6. Mark course completed
    if progress.lessons_completed >= progress.total_lessons:
        progress.lessons_completed = progress.total_lessons
        progress.progress_percentage = 100
        progress.status = "completed"
        progress.certificate_earned = True
    else:
        progress.status = "in_progress"

    # 7. Update roadmap skill progress
    course = db.query(LearningCourse).filter(
        LearningCourse.id == lesson.course_id
    ).first()

    if course and course.category:

        roadmap = db.query(Roadmap).filter(
            Roadmap.user_id == current_user.id,
            Roadmap.status == "active"
        ).first()

        if roadmap:

            roadmap_step = db.query(RoadmapStep).filter(
                RoadmapStep.roadmap_id == roadmap.id,
                RoadmapStep.title == f"Master {course.category}"
            ).first()

            if roadmap_step:

                # Update skill percentage
                roadmap_step.completion_percentage = progress.progress_percentage

                # Update skill status
                if progress.progress_percentage >= 100:
                    roadmap_step.status = "completed"

                elif progress.progress_percentage > 0:
                    roadmap_step.status = "in_progress"

            # Get all roadmap steps
            all_steps = db.query(RoadmapStep).filter(
                RoadmapStep.roadmap_id == roadmap.id
            ).all()

            if all_steps:

                # Calculate overall roadmap percentage
                roadmap.overall_progress = sum(
                    step.completion_percentage
                    for step in all_steps
                ) / len(all_steps)

                # Count completed skills
                roadmap.completed_steps = sum(
                    1 for step in all_steps
                    if step.status == "completed"
                )

    # 8. Save everything
    db.commit()
    db.refresh(progress)

    return {
        "success": True,
        "message": "Lesson marked as completed",
        "data": {
            "lesson_id": lesson_id,
            "lessons_completed": progress.lessons_completed,
            "total_lessons": progress.total_lessons,
            "progress_percentage": progress.progress_percentage,
            "status": progress.status,
            "certificate_earned": progress.certificate_earned
        }
    }

@router.post("/quiz/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: str,
    answers: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit quiz answers"""
    # Implementation for quiz submission
    return {
        "success": True,
        "message": "Quiz submitted",
        "data": {"score": 85}
    }