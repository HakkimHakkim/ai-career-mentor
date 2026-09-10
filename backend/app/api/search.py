from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.career import Career, Skill
from app.models.learning import LearningCourse
from app.models.project import Project
from app.models.quiz import Job

router = APIRouter(prefix="/api/v1/search", tags=["search"])

@router.get("/")
async def search(
    q: str = Query(..., min_length=1, max_length=100),
    category: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search across all resources"""

    search_query = f"%{q}%"

    career_query = db.query(Career).filter(
        Career.title.ilike(search_query)
    )
    if category:
        career_query = career_query.filter(Career.category == category)
    careers = career_query.limit(5).all()

    skill_query = db.query(Skill).filter(
        Skill.name.ilike(search_query)
    )
    if category:
        skill_query = skill_query.filter(Skill.category == category)
    skills = skill_query.limit(5).all()

    course_query = db.query(LearningCourse).filter(
        LearningCourse.title.ilike(search_query)
    )
    if category:
        course_query = course_query.filter(LearningCourse.category == category)
    courses = course_query.limit(5).all()

    project_query = db.query(Project).filter(
        Project.title.ilike(search_query)
    )
    if category:
        project_query = project_query.filter(Project.difficulty == category)
    projects = project_query.limit(5).all()

    job_query = db.query(Job).filter(
        (Job.title.ilike(search_query)) |
        (Job.company.ilike(search_query))
    ).filter(Job.is_active == True)
    if category:
        job_query = job_query.filter(Job.experience_level == category)
    jobs = job_query.limit(5).all()

    return {
        "success": True,
        "query": q,
        "results_count": len(careers) + len(skills) + len(courses) + len(projects) + len(jobs),
        "results": {
            "careers": [
                {
                    "id": c.id,
                    "title": c.title,
                    "category": c.category,
                    "difficulty": c.difficulty,
                    "type": "career"
                }
                for c in careers
            ],
            "skills": [
                {
                    "id": s.id,
                    "name": s.name,
                    "category": s.category,
                    "difficulty": s.difficulty,
                    "type": "skill"
                }
                for s in skills
            ],
            "courses": [
                {
                    "id": c.id,
                    "title": c.title,
                    "category": c.category,
                    "difficulty": c.difficulty,
                    "duration": c.duration_hours,
                    "type": "course"
                }
                for c in courses
            ],
            "projects": [
                {
                    "id": p.id,
                    "title": p.title,
                    "difficulty": p.difficulty,
                    "hours": p.estimated_hours,
                    "type": "project"
                }
                for p in projects
            ],
            "jobs": [
                {
                    "id": j.id,
                    "title": j.title,
                    "company": j.company,
                    "location": j.location,
                    "experience_level": j.experience_level,
                    "type": "job"
                }
                for j in jobs
            ]
        }
    }

@router.get("/careers")
async def search_careers(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search only careers"""

    query = db.query(Career).filter(
        Career.title.ilike(f"%{q}%")
    )
    total = query.count()
    careers = query.offset(skip).limit(limit).all()

    return {
        "success": True,
        "data": careers,
        "pagination": {"skip": skip, "limit": limit, "total": total}
    }

@router.get("/courses")
async def search_courses(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search only courses"""

    query = db.query(LearningCourse).filter(
        LearningCourse.title.ilike(f"%{q}%")
    )
    total = query.count()
    courses = query.offset(skip).limit(limit).all()

    return {
        "success": True,
        "data": courses,
        "pagination": {"skip": skip, "limit": limit, "total": total}
    }

@router.get("/jobs")
async def search_jobs(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search only jobs"""

    query = db.query(Job).filter(
        (Job.title.ilike(f"%{q}%")) |
        (Job.company.ilike(f"%{q}%"))
    ).filter(Job.is_active == True)

    total = query.count()
    jobs = query.offset(skip).limit(limit).all()

    return {
        "success": True,
        "data": jobs,
        "pagination": {"skip": skip, "limit": limit, "total": total}
    }