from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.services.grok_service import GrokService
from pydantic import BaseModel
from typing import List, Optional
import json

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

class TutorMessage(BaseModel):
    message: str
    language: Optional[str] = "en"

class CareerAdviceRequest(BaseModel):
    career: str
    current_skills: List[str]
    missing_skills: List[str]
    experience: str

@router.post("/tutor")
async def ai_tutor(
    request: TutorMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI Tutor endpoint"""
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
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing request: {str(e)}"
        )

@router.post("/career-advice")
async def get_career_advice(
    request: CareerAdviceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized career advice"""
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
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )

@router.post("/learning-plan")
async def get_learning_plan(
    career: str,
    current_skills: List[str],
    learning_hours: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized learning plan"""
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
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )