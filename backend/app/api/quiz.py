import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.services.quiz_service import QuizService

router = APIRouter(prefix="/api/v1/quiz", tags=["quiz"])


class SubmitQuizRequest(BaseModel):
    quiz_session_id: str
    answers: List[int]


@router.get("/skills")
async def get_quiz_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List roadmap skills available for quizzing, with best score + next difficulty"""
    skills = QuizService.get_roadmap_skills(current_user.id, db)

    if not skills:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No roadmap found. Please complete career discovery first."
        )

    scores_by_skill = {
        s["skill_name"]: s for s in QuizService.get_my_scores(current_user.id, db)
    }

    data = []
    for skill in skills:
        entry = scores_by_skill.get(skill)
        data.append({
            "skill_name": skill,
            "best_score": entry["best_score"] if entry else None,
            "attempts": entry["attempts"] if entry else 0,
            "recent_score": entry["recent_score"] if entry else None,
            "recent_difficulty": entry["recent_difficulty"] if entry else None,
            "recent_attempted_at": entry["recent_attempted_at"] if entry else None,
            "next_difficulty": QuizService.get_next_difficulty(current_user.id, skill, db)
        })

    return {"success": True, "data": data}


@router.post("/generate/{skill_name}")
async def generate_quiz(
    skill_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new quiz for a skill at the user's current difficulty level"""
    try:
        session = await QuizService.generate_quiz_session(
            current_user.id, skill_name, db
        )

        questions = json.loads(session.questions)

        # Strip correct_index/explanation before sending to frontend
        safe_questions = [
            {"question": q["question"], "options": q["options"]}
            for q in questions
        ]

        return {
            "success": True,
            "data": {
                "quiz_session_id": session.id,
                "skill_name": session.skill_name,
                "difficulty": session.difficulty,
                "questions": safe_questions
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating quiz: {str(e)}"
        )


@router.post("/submit")
async def submit_quiz(
    request: SubmitQuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit answers and get graded result, with correct answers for review"""
    try:
        result = QuizService.submit_quiz(
            request.quiz_session_id,
            current_user.id,
            request.answers,
            db
        )
        return {"success": True, "data": result}

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting quiz: {str(e)}"
        )


@router.get("/my-scores")
async def my_scores(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get best scores per skill across all attempts"""
    scores = QuizService.get_my_scores(current_user.id, db)
    return {"success": True, "data": scores}