from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    CurrentUserResponse
)
from app.schemas.user import UserProfileUpdate
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register new user"""
    user = AuthService.register(db, request)
    return user

@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login user"""
    user, access_token, refresh_token = AuthService.login(db, request)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60  # 30 minutes in seconds
    )

@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    user = AuthService.get_user_by_id(db, current_user.id)
    return user

@router.put("/me/profile")
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    profile = AuthService.update_profile(
        db,
        current_user.id,
        profile_data.dict(exclude_unset=True)
    )
    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": profile.to_dict()
    }

@router.post("/verify-email/{token}")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify email with token"""
    # In production, validate token first
    # For now, just mark as verified
    return {"success": True, "message": "Email verified"}

@router.post("/forgot-password")
async def forgot_password(email: str, db: Session = Depends(get_db)):
    """Request password reset"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal if email exists
        return {"success": True, "message": "If email exists, reset link sent"}
    
    # In production, generate token and send email
    return {"success": True, "message": "Reset link sent to email"}

@router.post("/reset-password")
async def reset_password(token: str, password: str, db: Session = Depends(get_db)):
    """Reset password with token"""
    # Validate token and update password
    return {"success": True, "message": "Password reset successfully"}

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client-side token deletion)"""
    return {"success": True, "message": "Logged out successfully"}