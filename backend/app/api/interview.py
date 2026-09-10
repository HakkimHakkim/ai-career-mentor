from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json

from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.interview import InterviewSession
from app.services.interview_service import InterviewService


router = APIRouter(prefix="/api/v1/interview", tags=["interview"])


def parse_tips(tips_raw):
    """tips column stores either a JSON list or a JSON-encoded plain string"""
    if not tips_raw:
        return ""
    try:
        parsed = json.loads(tips_raw)
        if isinstance(parsed, list):
            return "\n".join(str(t) for t in parsed)
        return str(parsed)
    except Exception:
        return tips_raw

# ============================================================
# REQUEST SCHEMAS
# ============================================================

class CreateSessionRequest(BaseModel):
    interview_type: str
    # technical, hr, behavioral, mock


class SubmitAnswerRequest(BaseModel):
    question_id: str
    answer_text: str


# ============================================================
# START INTERVIEW
# ============================================================

@router.post("/start")
async def start_interview(
    request: CreateSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new interview session"""

    try:
        session = await InterviewService.create_session(
            current_user,
            request.interview_type,
            db
        )

        return {
            "success": True,
            "message": "Interview session started",
            "data": {
                "session_id": session.id,
                "interview_type": session.interview_type,
                "title": session.title,
                "difficulty": session.difficulty,
                "total_questions": session.total_questions,
                "questions": [
                    {
                        "id": question.id,
                        "question": question.question_text,
                        "question_type": question.question_type,
                        "order": question.order
                    }
                    for question in sorted(
                        session.questions,
                        key=lambda q: q.order
                    )
                ]
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except Exception as e:
        print(f"Start interview error: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start interview"
        )


# ============================================================
# GET SINGLE INTERVIEW SESSION
# ============================================================

@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interview session details"""

    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    return {
        "success": True,
        "data": session.to_dict()
    }


# ============================================================
# SUBMIT ANSWER
# ============================================================

@router.post("/sessions/{session_id}/answer")
async def submit_answer(
    session_id: str,
    request: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit and evaluate an interview answer"""

    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    if session.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview session is already completed"
        )

    try:
        # Evaluate answer
        answer = await InterviewService.evaluate_answer(
            session_id,
            request.question_id,
            request.answer_text,
            db
        )

        # 60+ = acceptable
        score = answer.score or 0
        acceptable = score >= 60

        # Find current question
        current_question = None

        for question in session.questions:
            if question.id == request.question_id:
                current_question = question
                break

        if not current_question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )

        # Find next question
        next_question = None

        if acceptable:
            from app.models.interview import InterviewQuestion

            next_question = (
                db.query(InterviewQuestion)
                .filter(
                    InterviewQuestion.session_id == session_id,
                    InterviewQuestion.order > current_question.order
                )
                .order_by(
                    InterviewQuestion.order.asc()
                )
                .first()
            )

        # Interview is completed only when:
        # 1. Current answer is acceptable
        # 2. There is no next question
        interview_completed = (
            acceptable and next_question is None
        )

        # If last question is answered successfully,
        # mark session as completed
        if interview_completed:
            session.status = "completed"

            try:
                session = InterviewService.complete_session(
                    session_id,
                    db
                )
            except Exception as e:
                print(f"Auto complete error: {e}")

        return {
            "success": True,
            "message": "Answer evaluated successfully",
            "data": {
                "session_id": session.id,

                # Answer result
                "answer": {
    "question_id": request.question_id,
    "answer_text": request.answer_text,
    "score": score,
    "acceptable": acceptable,
    "feedback": answer.feedback,
    "strengths": json.loads(answer.strengths or "[]"),
    "missing_points": json.loads(answer.missing_points or "[]"),
    "improvements": json.loads(answer.improvements or "[]")
},

"score": score,
"acceptable": acceptable,
"feedback": answer.feedback,
"strengths": json.loads(answer.strengths or "[]"),
"missing_points": json.loads(answer.missing_points or "[]"),
"improvements": json.loads(answer.improvements or "[]"),

                # Current question
                "current_question": {
                    "id": current_question.id,
                    "question": current_question.question_text,
                    "question_type": current_question.question_type,
                    "order": current_question.order
                },

                # Next question
                "next_question": (
                    {
                        "id": next_question.id,
                        "question": next_question.question_text,
                        "question_type": next_question.question_type,
                        "order": next_question.order,
                        "tips": parse_tips(next_question.tips)
                    }
                    if next_question
                    else None
                ),

                # Completion status
                "interview_completed": interview_completed,

                # Session information
                "interview_type": session.interview_type,
                "title": session.title,
                "difficulty": session.difficulty,
                "total_questions": session.total_questions,
                "questions_answered": session.questions_answered,
                "overall_score": session.overall_score,
                "status": session.status
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except HTTPException:
        raise

    except Exception as e:
        print(f"Submit answer error: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to evaluate answer"
        )


# ============================================================
# COMPLETE INTERVIEW
# ============================================================

@router.post("/sessions/{session_id}/complete")
async def complete_interview(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete interview session"""

    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    try:
        session = InterviewService.complete_session(
            session_id,
            db
        )

        return {
            "success": True,
            "message": "Interview completed",
            "data": {
                "session_id": session.id,
                "status": session.status,
                "overall_score": session.overall_score,
                "total_questions": session.total_questions,
                "questions_answered": session.questions_answered,
                "performance_feedback": session.performance_feedback
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except Exception as e:
        print(f"Complete interview error: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete interview"
        )


# ============================================================
# GET MY INTERVIEW SESSIONS
# ============================================================

@router.get("/my-sessions")
async def get_my_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all interview sessions of current user"""

    sessions = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == current_user.id
        )
        .order_by(
            InterviewSession.created_at.desc()
        )
        .all()
    )

    return {
        "success": True,
        "data": [
            {
                "session_id": session.id,
                "interview_type": session.interview_type,
                "title": session.title,
                "difficulty": session.difficulty,
                "total_questions": session.total_questions,
                "questions_answered": session.questions_answered,
                "overall_score": session.overall_score,
                "status": session.status,
                "created_at": session.created_at
            }
            for session in sessions
        ]
    }
    # ============================================================
# GET OVERALL REPORT (all interview types combined)
# ============================================================

@router.get("/overall-report")
async def get_overall_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Combined report across all completed interview sessions"""

    sessions = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status == "completed"
        )
        .all()
    )

    if not sessions:
        return {
            "success": True,
            "data": {
                "overall_score": 0,
                "total_sessions": 0,
                "by_type": {}
            }
        }

    by_type = {}
    all_scores = []

    for s in sessions:
        score = float(s.overall_score or 0)
        all_scores.append(score)

        by_type.setdefault(s.interview_type, []).append(score)

    by_type_avg = {
        t: round(sum(scores) / len(scores), 1)
        for t, scores in by_type.items()
    }

    overall_score = round(sum(all_scores) / len(all_scores), 1)

    return {
        "success": True,
        "data": {
            "overall_score": overall_score,
            "total_sessions": len(sessions),
            "by_type": by_type_avg
        }
    }