from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User, UserOnboarding, UserSkill
from app.models.career import Skill
from app.services.auth_service import AuthService
import json

router = APIRouter(prefix="/api/v1/onboarding", tags=["onboarding"])

class OnboardingStep1(BaseModel):
    education_level: str
    experience_years: int
    location: Optional[str] = None
    learning_hours_per_week: int

class OnboardingStep2(BaseModel):
    skills: List[str]  # Skill IDs
    experience_level: str

class OnboardingStep3(BaseModel):
    interests: List[str]

class OnboardingStep4(BaseModel):
    selected_career: str  # Career ID

@router.get("/")
async def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get onboarding status"""
    
    onboarding = db.query(UserOnboarding).filter(
        UserOnboarding.user_id == current_user.id
    ).first()
    
    if not onboarding:
        onboarding = UserOnboarding(user_id=current_user.id)
        db.add(onboarding)
        db.commit()
        db.refresh(onboarding)
    
    return {
        "success": True,
        "data": {
            "step_1_completed": onboarding.step_1_profile_completed,
            "step_2_completed": onboarding.step_2_skills_completed,
            "step_3_completed": onboarding.step_3_assessment_completed,
            "step_4_completed": onboarding.step_4_career_selected,
            "is_complete": onboarding.is_complete,
            "current_step": sum([
                onboarding.step_1_profile_completed,
                onboarding.step_2_skills_completed,
                onboarding.step_3_assessment_completed,
                onboarding.step_4_career_selected
            ]) + 1
        }
    }

@router.post("/step-1")
async def complete_step_1(
    request: OnboardingStep1,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete onboarding step 1 - Profile"""
    
    profile_data = {
        "education": request.education_level,
        "experience_level": "beginner" if request.experience_years == 0 else "intermediate" if request.experience_years < 3 else "advanced",
        "location": request.location,
        "learning_hours_per_week": request.learning_hours_per_week
    }
    
    AuthService.update_profile(db, current_user.id, profile_data)
    
    # Update onboarding
    onboarding = db.query(UserOnboarding).filter(
        UserOnboarding.user_id == current_user.id
    ).first()
    
    if not onboarding:
        onboarding = UserOnboarding(user_id=current_user.id)
        db.add(onboarding)
    
    onboarding.step_1_profile_completed = True
    onboarding.education_level = request.education_level
    onboarding.experience_years = request.experience_years
    
    db.commit()
    
    return {
        "success": True,
        "message": "Step 1 completed",
        "data": {"step": 1, "next_step": 2}
    }

@router.post("/step-2")
async def complete_step_2(
    request: OnboardingStep2,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete onboarding step 2 - Skills"""
    
    # Add skills to user
    for skill_id in request.skills:
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        
        if skill:
            existing = db.query(UserSkill).filter(
                UserSkill.user_id == current_user.id,
                UserSkill.skill_id == skill_id
            ).first()
            
            if not existing:
                user_skill = UserSkill(
                    user_id=current_user.id,
                    skill_id=skill_id,
                    proficiency_level=request.experience_level
                )
                db.add(user_skill)
    
    # Update profile
    AuthService.update_profile(
        db,
        current_user.id,
        {"experience_level": request.experience_level}
    )
    
    # Update onboarding
    onboarding = db.query(UserOnboarding).filter(
        UserOnboarding.user_id == current_user.id
    ).first()
    
    if onboarding:
        onboarding.step_2_skills_completed = True
        onboarding.current_skills = json.dumps(request.skills)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Step 2 completed",
        "data": {"step": 2, "next_step": 3}
    }

@router.post("/step-3")
async def complete_step_3(
    request: OnboardingStep3,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete onboarding step 3 - Interests"""
    
    # Update profile
    AuthService.update_profile(
        db,
        current_user.id,
        {"interests": ",".join(request.interests)}
    )
    
    # Update onboarding
    onboarding = db.query(UserOnboarding).filter(
        UserOnboarding.user_id == current_user.id
    ).first()
    
    if onboarding:
        onboarding.step_3_assessment_completed = True
        onboarding.interests = json.dumps(request.interests)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Step 3 completed",
        "data": {"step": 3, "next_step": 4}
    }

@router.post("/step-4")
async def complete_step_4(
    request: OnboardingStep4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete onboarding step 4 - Career Selection"""
    
    from app.models.career import Career
    from app.services.roadmap_service import RoadmapService
    
    career = db.query(Career).filter(Career.id == request.selected_career).first()
    
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found"
        )
    
    # Update profile
    AuthService.update_profile(
        db,
        current_user.id,
        {"career_goal": career.title, "onboarding_completed": True}
    )
    
    # Generate roadmap
    roadmap = RoadmapService.generate_roadmap(current_user, career, db)
    
    # Update onboarding
    onboarding = db.query(UserOnboarding).filter(
        UserOnboarding.user_id == current_user.id
    ).first()
    
    if onboarding:
        onboarding.step_4_career_selected = True
        onboarding.is_complete = True
    
    db.commit()
    
    return {
        "success": True,
        "message": "Onboarding completed! Roadmap generated.",
        "data": {
            "step": 4,
            "career": career.title,
            "roadmap_id": roadmap.id,
            "roadmap_steps": len(roadmap.steps)
        }
    }

@router.post("/skip")
async def skip_onboarding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Skip onboarding"""
    
    onboarding = db.query(UserOnboarding).filter(
        UserOnboarding.user_id == current_user.id
    ).first()
    
    if onboarding:
        onboarding.is_complete = True
    
    AuthService.update_profile(db, current_user.id, {"onboarding_completed": True})
    
    return {
        "success": True,
        "message": "Onboarding skipped"
    }