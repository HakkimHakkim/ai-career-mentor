import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.career import CareerRecommendation, Career
from app.services.resume_service import ResumeService
from app.services.grok_service import GrokService

router = APIRouter(prefix="/api/v1/resume", tags=["resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload resume"""
    try:
        content = await file.read()

        is_valid, message = ResumeService.validate_file(
            file.filename,
            len(content)
        )

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )

        file_type = file.filename.rsplit(".", 1)[1].lower()
        stored_filename = ResumeService.save_file(
            content,
            file.filename
        )

        resume = ResumeService.save_resume(
            current_user.id,
            file.filename,
            stored_filename,
            file_type,
            db
        )

        # Get user's selected career (rank #1), fallback to profile career_goal
        top_rec = db.query(CareerRecommendation).filter(
            CareerRecommendation.user_id == current_user.id
        ).order_by(CareerRecommendation.rank).first()

        career_goal = (
            current_user.profile.career_goal
            if hasattr(current_user, "profile")
            and current_user.profile
            and current_user.profile.career_goal
            else "Software Engineer"
        )
        required_skills = []
        career_title = None

        if top_rec:
            career = db.query(Career).filter(Career.id == top_rec.career_id).first()
            if career:
                career_title = career.title
                career_goal = career.title

            matched = json.loads(top_rec.matched_skills or "[]")
            missing = json.loads(top_rec.missing_skills or "[]")
            required_skills = list(set(matched + missing))

        analysis = await ResumeService.analyze_resume(
            resume,
            db,
            career_goal,
            required_skills,
            career_title
        )

        return {
            "success": True,
            "message": "Resume uploaded and analyzed",
            "data": {
                "resume_id": resume.id,
                "analysis": analysis.to_dict()
            }
        }

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading resume: {str(e)}"
        )


@router.get("/my-resume")
async def get_my_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's resume"""
    resume = ResumeService.get_resume(current_user.id, db)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found"
        )

    return {
        "success": True,
        "data": resume.to_dict()
    }


@router.get("/{resume_id}/analysis")
async def get_resume_analysis(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get resume analysis"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    return {
        "success": True,
        "data": resume.analysis.to_dict() if resume.analysis else None
    }


@router.post("/{resume_id}/improve")
async def improve_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI suggestions to improve resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    if not resume.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text not extracted"
        )

    try:
        suggestions = await GrokService.analyze_resume_for_career(
            resume.extracted_text,
            current_user.profile.career_goal or "Software Engineer"
        )

        return {
            "success": True,
            "data": suggestions
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing resume: {str(e)}"
        )


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    ResumeService.delete_resume(resume_id, db)

    return {
        "success": True,
        "message": "Resume deleted successfully"
    }