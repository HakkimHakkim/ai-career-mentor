from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.learning import UserCourseProgress
from app.models.interview import InterviewSession
from app.models.roadmap import Roadmap
from app.models.resume import ResumeAnalysis
from app.models.quiz import JobApplication

router = APIRouter(prefix="/api/v1/progress", tags=["progress"])

@router.get("/")
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed user progress"""

    # Learning progress
    courses = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id
    ).all()

    learning_progress = 0
    if courses:
        learning_progress = sum([c.progress_percentage for c in courses]) / len(courses)

    # Roadmap progress
    roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Roadmap.status == "active"
    ).first()

    roadmap_progress = roadmap.overall_progress if roadmap else 0

    # Interview readiness
    interviews = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).all()

    interview_score = 0
    if interviews:
        completed = [i for i in interviews if i.overall_score]
        if completed:
            interview_score = sum([i.overall_score for i in completed]) / len(completed)

    # Resume score
    resume_score = 0
    from app.models.resume import Resume
    resume = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.is_primary == True
    ).first()

    if resume and resume.analysis:
        resume_score = resume.analysis.overall_score or 0

    # Job applications
    applications = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    ).all()

    # Calculate overall
    scores = [learning_progress, roadmap_progress, interview_score, resume_score]
    overall_progress = sum(scores) / len(scores) if scores else 0

    return {
        "success": True,
        "data": {
            "overall_progress": overall_progress,
            "breakdown": {
                "learning_progress": learning_progress,
                "roadmap_progress": roadmap_progress,
                "interview_readiness": interview_score,
                "resume_score": resume_score
            },
            "stats": {
                "courses_completed": sum([1 for c in courses if c.status == "completed"]),
                "total_courses": len(courses),
                "interviews_taken": len(interviews),
                "applications_submitted": len(applications)
            }
        }
    }

@router.get("/weekly")
async def get_weekly_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly progress"""

    from datetime import datetime, timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)

    # This week's activities
    new_courses = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id,
        UserCourseProgress.created_at >= week_ago
    ).count()

    new_interviews = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id,
        InterviewSession.created_at >= week_ago
    ).count()

    return {
        "success": True,
        "data": {
            "period": "Last 7 days",
            "activities": {
                "courses_started": new_courses,
                "interviews_taken": new_interviews,
                "hours_studied": 0  # Calculate from actual time
            }
        }
    }