from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.career import CareerRecommendation
from app.models.learning import UserCourseProgress
from app.models.interview import InterviewSession
from app.models.quiz import JobMatch, JobApplication

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

@router.get("/overview")
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard overview"""

    # Career recommendation
    career_rec = db.query(CareerRecommendation).filter(
        CareerRecommendation.user_id == current_user.id
    ).first()

    # Learning progress
    learning_courses = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id
    ).all()

    avg_learning_progress = 0
    if learning_courses:
        avg_learning_progress = sum([c.progress_percentage for c in learning_courses]) / len(learning_courses)

    # Interview sessions
    interviews = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).all()

    avg_interview_score = 0
    if interviews:
        completed = [i for i in interviews if i.overall_score]
        if completed:
            avg_interview_score = sum([i.overall_score for i in completed]) / len(completed)

    # Job matches
    job_matches = db.query(JobMatch).filter(
        JobMatch.user_id == current_user.id
    ).all()

    # Job applications
    applications = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    ).all()

    return {
        "success": True,
        "data": {
            "user": {
                "name": current_user.name,
                "email": current_user.email,
                "career_goal": current_user.profile.career_goal if current_user.profile else None
            },
            "metrics": {
                "career_match": career_rec.match_score if career_rec else 0,
                "learning_progress": avg_learning_progress,
                "interview_readiness": avg_interview_score,
                "job_readiness": (avg_learning_progress + avg_interview_score) / 2
            },
            "stats": {
                "courses_enrolled": len(learning_courses),
                "interviews_taken": len(interviews),
                "job_matches": len(job_matches),
                "applications": len(applications)
            },
            "recent_activity": {
                "latest_course": learning_courses[-1].course.title if learning_courses else None,
                "latest_interview": interviews[-1].interview_type if interviews else None,
                "top_job_match": job_matches[0].job.title if job_matches else None
            }
        }
    }

@router.get("/weekly-summary")
async def get_weekly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly summary"""

    from datetime import datetime, timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)

    # Activities this week
    new_interviews = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id,
        InterviewSession.created_at >= week_ago
    ).count()

    completed_lessons = db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == current_user.id,
        UserCourseProgress.status == "completed"
    ).count()

    return {
        "success": True,
        "data": {
            "period": "This Week",
            "activities": {
                "interviews_taken": new_interviews,
                "lessons_completed": completed_lessons,
                "jobs_explored": 0,
                "hours_studied": 0
            }
        }
    }