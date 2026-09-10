from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.models.career import Career, CareerRecommendation
from app.db import get_db
from app.utils.dependencies import get_current_user

from app.models.user import User
from app.models.roadmap import Roadmap, RoadmapStep
from app.models.career import Career

from app.services.roadmap_service import RoadmapService


router = APIRouter(
    prefix="/api/v1/roadmap",
    tags=["roadmap"]
)


# ==========================================================
# REQUEST MODELS
# ==========================================================

class GenerateRoadmapRequest(BaseModel):
    career_id: str


class UpdateProgressRequest(BaseModel):
    progress: float = Field(
        ...,
        ge=0,
        le=100
    )


# ==========================================================
# SERIALIZERS
# ==========================================================

def serialize_step(step: RoadmapStep):
    progress = float(
        step.completion_percentage or 0
    )

    return {
        "id": str(step.id),
        "title": step.title,
        "description": step.description,
        "order": step.order,
        "estimated_hours": step.estimated_hours,
        "status": step.status,
        "progress": progress,
        "completion_percentage": progress,
        "resources": step.resources
    }


def serialize_roadmap(roadmap: Roadmap):

    steps = sorted(
        roadmap.steps or [],
        key=lambda item: item.order or 0
    )

    return {
        "id": str(roadmap.id),
        "title": roadmap.title,
        "description": roadmap.description,

        "career": (
            roadmap.career.title
            if roadmap.career
            else None
        ),

        "total_steps": roadmap.total_steps or 0,

        "completed_steps": (
            roadmap.completed_steps or 0
        ),

        "overall_progress": float(
            roadmap.overall_progress or 0
        ),

        "estimated_duration_days":
            roadmap.estimated_duration_days,

        "learning_hours_per_week":
            roadmap.learning_hours_per_week,

        "status": roadmap.status,

        "steps": [
            serialize_step(step)
            for step in steps
        ]
    }


# ==========================================================
# GENERATE NEW ROADMAP
# ==========================================================

@router.post("/generate")
async def generate_roadmap(
    request: GenerateRoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    career = (
        db.query(Career)
        .filter(
            Career.id == request.career_id
        )
        .first()
    )

    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found"
        )


    # ------------------------------------------------------
    # DEACTIVATE ALL OLD ROADMAPS
    # ------------------------------------------------------

    old_roadmaps = (
        db.query(Roadmap)
        .filter(
            Roadmap.user_id == current_user.id,
            Roadmap.status == "active"
        )
        .all()
    )

    for old_roadmap in old_roadmaps:
        old_roadmap.status = "inactive"

    db.commit()


    # ------------------------------------------------------
    # GENERATE NEW ROADMAP
    # ------------------------------------------------------

    roadmap = RoadmapService.generate_roadmap(
        user=current_user,
        career=career,
        db=db,
        matched_skills=[]
    )

    db.refresh(roadmap)


    return {
        "success": True,
        "message": "New roadmap generated successfully",
        "data": serialize_roadmap(roadmap)
    }


# ==========================================================
# GET CURRENT ACTIVE ROADMAP
# ==========================================================

@router.get("/")
async def get_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current roadmap"""

    # First try active roadmap
    roadmap = (
        db.query(Roadmap)
        .filter(
            Roadmap.user_id == current_user.id,
            Roadmap.status == "active"
        )
        .order_by(
            Roadmap.created_at.desc()
        )
        .first()
    )

    # If no active roadmap, get latest roadmap
    if not roadmap:
        roadmap = (
            db.query(Roadmap)
            .filter(
                Roadmap.user_id == current_user.id
            )
            .order_by(
                Roadmap.created_at.desc()
            )
            .first()
        )

    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No roadmap found. Please generate a roadmap first."
        )

    return {
        "success": True,
        "data": serialize_roadmap(roadmap)
    }


# ==========================================================
# GET ROADMAP BY ID
# ==========================================================

@router.get("/{roadmap_id}")
async def get_roadmap_by_id(
    roadmap_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    roadmap = (
        db.query(Roadmap)
        .filter(
            Roadmap.id == roadmap_id,
            Roadmap.user_id == current_user.id
        )
        .first()
    )


    if not roadmap:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found"
        )


    return {
        "success": True,
        "data": serialize_roadmap(roadmap)
    }


# ==========================================================
# COMPLETE STEP
# ==========================================================

@router.put("/steps/{step_id}/complete")
async def complete_roadmap_step(
    step_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    step = (
        db.query(RoadmapStep)
        .filter(
            RoadmapStep.id == step_id
        )
        .first()
    )


    if not step:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Step not found"
        )


    roadmap = (
        db.query(Roadmap)
        .filter(
            Roadmap.id == step.roadmap_id,
            Roadmap.user_id == current_user.id
        )
        .first()
    )


    if not roadmap:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission"
        )


    updated_step = RoadmapService.complete_step(
        roadmap_id=str(roadmap.id),
        step_id=str(step.id),
        db=db
    )


    if not updated_step:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unable to complete step"
        )


    db.refresh(roadmap)


    return {
        "success": True,
        "message": "Step completed successfully",

        "data": {

            "step":
                serialize_step(updated_step),

            "roadmap_progress":
                float(
                    roadmap.overall_progress or 0
                ),

            "completed_steps":
                roadmap.completed_steps or 0,

            "roadmap_status":
                roadmap.status
        }
    }


# ==========================================================
# UPDATE STEP PROGRESS
# ==========================================================

@router.put("/steps/{step_id}/progress")
async def update_step_progress(
    step_id: str,
    request: UpdateProgressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    step = (
        db.query(RoadmapStep)
        .filter(
            RoadmapStep.id == step_id
        )
        .first()
    )


    if not step:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Step not found"
        )


    roadmap = (
        db.query(Roadmap)
        .filter(
            Roadmap.id == step.roadmap_id,
            Roadmap.user_id == current_user.id
        )
        .first()
    )


    if not roadmap:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission"
        )


    updated_step = (
        RoadmapService.update_step_progress(
            step_id=str(step.id),
            progress=request.progress,
            db=db
        )
    )


    if not updated_step:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unable to update step"
        )


    db.refresh(roadmap)


    return {

        "success": True,

        "message":
            "Progress updated successfully",

        "data": {

            "step":
                serialize_step(updated_step),

            "roadmap_progress":
                float(
                    roadmap.overall_progress or 0
                ),

            "completed_steps":
                roadmap.completed_steps or 0,

            "roadmap_status":
                roadmap.status
        }
    }