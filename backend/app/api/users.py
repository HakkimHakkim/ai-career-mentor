from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User, UserProfile
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/users", tags=["users"])

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    education: Optional[str] = None
    degree: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[str] = None
    experience_level: Optional[str] = None
    location: Optional[str] = None
    career_goal: Optional[str] = None
    interests: Optional[str] = None
    learning_hours_per_week: Optional[int] = None
    preferred_language: Optional[str] = None
    preferred_theme: Optional[str] = None
    remote_preference: Optional[str] = None
    bio: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.get("/me")
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    
    user = AuthService.get_user_by_id(db, current_user.id)
    
    return {
        "success": True,
        "data": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
            "profile": user.profile.to_dict() if user.profile else None,
            "created_at": user.created_at
        }
    }

@router.put("/me")
async def update_user_profile(
    update_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    
    # Update user fields
    if update_data.name:
        current_user.name = update_data.name
    if update_data.phone:
        current_user.phone = update_data.phone
    
    db.commit()
    
    # Update profile
    profile_data = update_data.dict(exclude_unset=True, exclude={"name", "phone"})
    profile = AuthService.update_profile(db, current_user.id, profile_data)
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": profile.to_dict()
    }

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    
    from app.utils.security import verify_password, hash_password
    
    # Verify current password
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.password_hash = hash_password(request.new_password)
    db.commit()
    
    return {
        "success": True,
        "message": "Password changed successfully"
    }

@router.delete("/me")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account"""
    
    # Soft delete - set inactive
    AuthService.deactivate_user(db, current_user.id)
    
    return {
        "success": True,
        "message": "Account has been deleted"
    }

@router.get("/preferences")
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user preferences"""
    
    profile = current_user.profile
    
    return {
        "success": True,
        "data": {
            "preferred_language": profile.preferred_language if profile else "en",
            "preferred_theme": profile.preferred_theme if profile else "dark",
            "learning_hours_per_week": profile.learning_hours_per_week if profile else 10,
            "notifications_enabled": True
        }
    }

@router.put("/preferences")
async def update_preferences(
    preferences: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user preferences"""
    
    AuthService.update_profile(db, current_user.id, preferences)
    
    return {
        "success": True,
        "message": "Preferences updated"
    }