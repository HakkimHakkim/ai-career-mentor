from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.services.grok_service import GrokService
from app.utils.rate_limit import enforce_rate_limit
from app.config import get_settings
from pydantic import BaseModel, Field
from typing import List, Optional
import json

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])
settings = get_settings()

class TutorMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    language: Optional[str] = Field(default="en", max_length=16)

class CareerAdviceRequest(BaseModel):
    career: str = Field(..., min_length=1, max_length=200)
    current_skills: List[str] = Field(..., max_length=50)
    missing_skills: List[str] = Field(..., max_length=50)
    experience: str = Field(..., max_length=100)

@router.post("/tutor")
async def ai_tutor(
    request: TutorMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI Tutor endpoint"""
    enforce_rate_limit(db, f"ai:{current_user.id}", settings.RATE_LIMIT_AI_TUTOR, 60)
    try:
        system_prompt = f"""You are an expert career and learning tutor. 
        Help the user learn about their career path, skills, and personal development.
        The user is learning {current_user.profile.career_goal or 'a new skill'}.
        User's experience level: {current_user.profile.experience_level or 'beginner'}.
        Respond in {request.language} language."""
        
        response = await GrokService.call_grok(
            prompt=request.message,
            system_prompt=system_prompt,
            max_tokens=1000
        )
        
        return {
            "success": True,
            "data": {
                "response": response,
                "language": request.language
            }
        }
    
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI service is temporarily unavailable"
        )

@router.post("/career-advice")
async def get_career_advice(
    request: CareerAdviceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized career advice"""
    enforce_rate_limit(db, f"ai:{current_user.id}", settings.RATE_LIMIT_AI_TUTOR, 60)
    try:
        advice = await GrokService.get_career_explanation(
            request.career,
            request.current_skills,
            request.missing_skills,
            request.experience
        )
        
        return {
            "success": True,
            "data": {
                "advice": advice,
                "career": request.career
            }
        }
    
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI service is temporarily unavailable"
        )

@router.post("/learning-plan")
async def get_learning_plan(
    career: str = Query(..., min_length=1, max_length=200),
    current_skills: List[str] = Query(..., max_length=50),
    learning_hours: int = Query(..., ge=1, le=80),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized learning plan"""
    enforce_rate_limit(db, f"ai:{current_user.id}", settings.RATE_LIMIT_AI_TUTOR, 60)
    try:
        plan = await GrokService.get_learning_suggestion(
            career,
            current_skills,
            learning_hours
        )
        
        return {
            "success": True,
            "data": {
                "plan": plan,
                "career": career
            }
        }
    
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI service is temporarily unavailable"
        )
