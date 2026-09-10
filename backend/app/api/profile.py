from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from pathlib import Path
import shutil
import uuid

from app.db import get_db
from app.models.user import User, UserProfile
from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"]
)


# =========================================================
# UPLOAD PROFILE PHOTO
# =========================================================

@router.post("/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Allowed image types
    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed"
        )

    # Upload directory
    upload_dir = Path("uploads/profile")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Get extension
    extension = Path(file.filename).suffix.lower()

    # Unique filename
    filename = f"{current_user.id}_{uuid.uuid4().hex}{extension}"

    file_path = upload_dir / filename

    # Save image
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save image: {str(e)}"
        )

    # Find profile
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    # Create profile if doesn't exist
    if not profile:
        profile = UserProfile(
            user_id=current_user.id
        )
        db.add(profile)

    # Save relative URL in database
    profile.profile_photo_url = f"/uploads/profile/{filename}"

    db.commit()
    db.refresh(profile)

    return {
        "success": True,
        "profile_photo_url": profile.profile_photo_url
    }


# =========================================================
# GET PROFILE
# =========================================================

@router.get("")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = UserProfile(
            user_id=current_user.id
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,

        "education": profile.education,
        "degree": profile.degree,
        "college": profile.college,
        "graduation_year": profile.graduation_year,

        "experience": profile.experience_level,
        "experience_level": profile.experience_level,

        "location": profile.location,
        "career_goal": profile.career_goal,
        "interests": profile.interests,

        "learning_hours_per_week": profile.learning_hours_per_week,
        "preferred_language": profile.preferred_language,
        "preferred_theme": profile.preferred_theme,
        "remote_preference": profile.remote_preference,

        "bio": profile.bio,
        "profile_photo_url": profile.profile_photo_url,
    }


# =========================================================
# UPDATE PROFILE
# =========================================================

@router.put("")
async def update_profile(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = UserProfile(
            user_id=current_user.id
        )
        db.add(profile)

    # User table
    if "name" in data:
        current_user.name = data["name"]

    # Profile table
    profile.education = data.get(
        "education",
        profile.education
    )

    profile.degree = data.get(
        "degree",
        profile.degree
    )

    profile.college = data.get(
        "college",
        profile.college
    )

    profile.graduation_year = data.get(
        "graduation_year",
        profile.graduation_year
    )

    profile.experience_level = data.get(
        "experience",
        data.get(
            "experience_level",
            profile.experience_level
        )
    )

    profile.location = data.get(
        "location",
        profile.location
    )

    profile.career_goal = data.get(
        "career_goal",
        profile.career_goal
    )

    profile.interests = data.get(
        "interests",
        profile.interests
    )

    profile.bio = data.get(
        "bio",
        profile.bio
    )

    db.commit()

    db.refresh(current_user)
    db.refresh(profile)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,

        "education": profile.education,
        "degree": profile.degree,
        "college": profile.college,
        "graduation_year": profile.graduation_year,

        "experience": profile.experience_level,
        "experience_level": profile.experience_level,

        "location": profile.location,
        "career_goal": profile.career_goal,
        "interests": profile.interests,

        "learning_hours_per_week": profile.learning_hours_per_week,
        "preferred_language": profile.preferred_language,
        "preferred_theme": profile.preferred_theme,
        "remote_preference": profile.remote_preference,

        "bio": profile.bio,
        "profile_photo_url": profile.profile_photo_url,
    }