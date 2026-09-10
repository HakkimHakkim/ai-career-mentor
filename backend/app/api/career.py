from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.services.roadmap_service import RoadmapService
from app.models.roadmap import Roadmap, RoadmapStep
from app.models.career import Career, CareerRecommendation
from app.schemas.career import (
    CareerPredictionRequest,
    CareerRecommendationResponse,
    CareerResponse
)
from app.services.ml_service import MLService
import json

router = APIRouter(prefix="/api/v1/career", tags=["career"])


@router.get("/")
async def list_careers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    """List all careers"""
    careers = db.query(Career).offset(skip).limit(limit).all()
    total = db.query(Career).count()

    return {
        "success": True,
        "data": careers,
        "pagination": {
            "skip": skip,
            "limit": limit,
            "total": total
        }
    }


@router.post("/predict")
async def predict_career(
    request: CareerPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI career recommendation"""
    try:
        recommendations = MLService.predict_careers(
            current_user,
            db,
            top_n=10,
            request=request
        )

        if not recommendations:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not generate recommendations"
            )

        MLService.save_recommendations(current_user, recommendations, db)

        return {
            "success": True,
            "message": "Career recommendations generated",
            "data": [
                {
                    "career": {
                        "id": rec['career'].id,
                        "title": rec['career'].title,
                        "description": rec['career'].description,
                        "category": rec['career'].category,
                        "difficulty": rec['career'].difficulty,
                        "average_learning_time": rec['career'].average_learning_time
                    },
                    "match_score": rec['score'],
                    "rank": rec['rank'],
                    "matched_skills": rec['matched_skills'],
                    "missing_skills": rec['missing_skills'],
                    "reasons": rec['reasons']
                }
                for rec in recommendations
            ]
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recommendations: {str(e)}"
        )


@router.get("/recommendations/my")
async def get_my_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's saved recommendations"""
    recommendations = db.query(CareerRecommendation).filter(
        CareerRecommendation.user_id == current_user.id
    ).order_by(CareerRecommendation.rank).all()

    return {
        "success": True,
        "data": recommendations
    }


@router.post("/select/{career_id}")
async def select_career(
    career_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """User picks their interested career — make it rank #1"""

    selected_rec = db.query(CareerRecommendation).filter(
        CareerRecommendation.user_id == current_user.id,
        CareerRecommendation.career_id == career_id
    ).first()

    if not selected_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career recommendation not found. Please run career discovery first."
        )

    old_rank = selected_rec.rank

    if old_rank != 1:
        current_top = db.query(CareerRecommendation).filter(
            CareerRecommendation.user_id == current_user.id,
            CareerRecommendation.rank == 1
        ).first()

        if current_top:
            current_top.rank = old_rank

        selected_rec.rank = 1
        db.commit()

    career = db.query(Career).filter(Career.id == career_id).first()

    return {
        "success": True,
        "message": f"{career.title} set as your career goal",
        "data": {
            "career_id": career.id,
            "career_title": career.title
        }
    }


@router.get("/my-career")
async def get_my_career(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's currently selected (rank #1) career with full details"""

    top_rec = db.query(CareerRecommendation).filter(
        CareerRecommendation.user_id == current_user.id
    ).order_by(CareerRecommendation.rank).first()

    if not top_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No career selected yet. Please complete career discovery first."
        )

    career = db.query(Career).filter(Career.id == top_rec.career_id).first()

    return {
        "success": True,
        "data": {
            "career": {
                "id": career.id,
                "title": career.title,
                "description": career.description,
                "category": career.category,
                "difficulty": career.difficulty,
                "average_learning_time": career.average_learning_time
            },
            "match_score": top_rec.match_score,
            "matched_skills": json.loads(top_rec.matched_skills or "[]"),
            "missing_skills": json.loads(top_rec.missing_skills or "[]"),
            "reasons": json.loads(top_rec.reasons or "[]")
        }
    }


@router.get("/roadmap/my")
async def get_my_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get roadmap, regenerating if the top predicted career changed"""

    top_rec = db.query(CareerRecommendation).filter(
        CareerRecommendation.user_id == current_user.id
    ).order_by(CareerRecommendation.rank).first()

    if not top_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No career prediction found. Please complete career discovery first."
        )

    roadmap = RoadmapService.get_roadmap(current_user.id, db)

    if not roadmap or str(roadmap.career_id) != str(top_rec.career_id):
        if roadmap:
            db.query(RoadmapStep).filter(
                RoadmapStep.roadmap_id == roadmap.id
            ).delete()
            db.delete(roadmap)
            db.commit()

        career = db.query(Career).filter(
            Career.id == top_rec.career_id
        ).first()

        matched_skills = json.loads(top_rec.matched_skills or "[]")

        roadmap = RoadmapService.generate_roadmap(
            current_user, career, db, matched_skills
        )
        db.refresh(roadmap)

    steps = db.query(RoadmapStep).filter(
        RoadmapStep.roadmap_id == roadmap.id
    ).order_by(RoadmapStep.order).all()

    return {
        "success": True,
        "data": {
            "id": roadmap.id,
            "title": roadmap.title,
            "description": roadmap.description,
            "career_title": roadmap.career.title,
            "overall_progress": roadmap.overall_progress,
            "steps": [
                {
                    "id": step.id,
                    "title": step.title,
                    "description": step.description,
                    "status": step.status,
                    "progress": step.completion_percentage,
                    "order": step.order
                }
                for step in steps
            ]
        }
    }


@router.get("/{career_id}")
async def get_career(
    career_id: str,
    db: Session = Depends(get_db)
):
    """Get career details"""
    career = db.query(Career).filter(Career.id == career_id).first()

    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found"
        )

    return {
        "success": True,
        "data": career
    }