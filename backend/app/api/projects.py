from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project, UserProject

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

@router.get("/")
async def list_projects(
    db: Session = Depends(get_db),
    difficulty: str = None,
    skip: int = 0,
    limit: int = 20
):
    """List all projects"""
    query = db.query(Project)
    
    if difficulty:
        query = query.filter(Project.difficulty == difficulty)
    
    projects = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "success": True,
        "data": projects,
        "pagination": {
            "skip": skip,
            "limit": limit,
            "total": total
        }
    }

@router.get("/recommended")
async def get_recommended_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recommended projects for user's career"""
    # Get user's career recommendation
    from app.models.career import CareerRecommendation
    
    recommendation = db.query(CareerRecommendation).filter(
        CareerRecommendation.user_id == current_user.id
    ).first()
    
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No career recommendation found"
        )
    
    # Get projects for that career
    projects = db.query(Project).filter(
        Project.career_id == recommendation.career_id
    ).all()
    
    return {
        "success": True,
        "data": projects
    }

@router.get("/{project_id}")
async def get_project(
    project_id: str,
    db: Session = Depends(get_db)
):
    """Get project details"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return {
        "success": True,
        "data": project
    }

@router.post("/{project_id}/start")
async def start_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if already started
    existing = db.query(UserProject).filter(
        UserProject.user_id == current_user.id,
        UserProject.project_id == project_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already working on this project"
        )
    
    # Create user project
    user_project = UserProject(
        user_id=current_user.id,
        project_id=project_id,
        title=project.title,
        description=project.description,
        status="in_progress"
    )
    
    db.add(user_project)
    db.commit()
    db.refresh(user_project)
    
    return {
        "success": True,
        "message": "Project started",
        "data": user_project.to_dict()
    }

@router.get("/my-projects")
async def get_my_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's projects"""
    projects = db.query(UserProject).filter(
        UserProject.user_id == current_user.id
    ).all()
    
    return {
        "success": True,
        "data": projects
    }