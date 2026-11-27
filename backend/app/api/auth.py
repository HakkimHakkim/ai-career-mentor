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
from app.utils.rate_limit import enforce_rate_limit
from app.config import get_settings
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from app.services.email_service import send_security_email, security_link
from app.utils.security import create_action_token
from datetime import timedelta
from sqlalchemy import func
import hashlib
import hmac

settings = get_settings()

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register new user"""
    user = AuthService.register(db, request)
    token = create_action_token(user.id, "email_verification", timedelta(hours=24))
    link = security_link("/verify-email", token)
    send_security_email(
        user.email, "Verify your AI Career Mentor email",
        f"Hello {user.name},\n\nVerify your email within 24 hours: {link}\n\nIf you did not create this account, ignore this email.",
    )
    return user

@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login user"""
    enforce_rate_limit(db, f"login:{request.email.lower()}", settings.RATE_LIMIT_LOGIN, 900)
    user, access_token, refresh_token = AuthService.login(db, request)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
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
    from app.utils.security import verify_token
    payload = verify_token(token)
    if not payload or payload.get("type") != "email_verification":
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    user = db.query(User).filter(User.id == payload["sub"], User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    user.is_verified = True
    db.commit()
    return {"success": True, "message": "Email verified"}

@router.post("/resend-verification")
async def resend_verification(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    enforce_rate_limit(db, f"verify:{request.email.lower()}", settings.RATE_LIMIT_EMAIL, 3600)
    user = db.query(User).filter(func.lower(User.email) == request.email.lower(), User.is_active.is_(True)).first()
    if user and not user.is_verified:
        token = create_action_token(user.id, "email_verification", timedelta(hours=24))
        link = security_link("/verify-email", token)
        try:
            send_security_email(user.email, "Verify your AI Career Mentor email", f"Verify your email within 24 hours: {link}")
        except HTTPException:
            pass
    return {"success": True, "message": "If your account needs verification, an email has been sent"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send a short-lived password reset link without revealing account existence."""
    enforce_rate_limit(db, f"reset:{request.email.lower()}", settings.RATE_LIMIT_EMAIL, 3600)
    user = db.query(User).filter(func.lower(User.email) == request.email.lower(), User.is_active.is_(True)).first()
    if user:
        credential_state = hashlib.sha256(user.password_hash.encode("utf-8")).hexdigest()
        token = create_action_token(user.id, "password_reset", timedelta(minutes=30), credential_state)
        link = security_link("/reset-password", token)
        try:
            send_security_email(user.email, "Reset your AI Career Mentor password", f"Reset your password within 30 minutes: {link}\n\nIf you did not request this, ignore this email.")
        except HTTPException:
            pass
    return {"success": True, "message": "If email exists, reset instructions will be sent"}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    from app.utils.security import hash_password, verify_token
    payload = verify_token(request.token)
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user = db.query(User).filter(User.id == payload["sub"], User.is_active.is_(True)).first()
    credential_state = hashlib.sha256(user.password_hash.encode("utf-8")).hexdigest() if user else ""
    if not user or not hmac.compare_digest(payload.get("credential_state", ""), credential_state):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user.password_hash = hash_password(request.password)
    db.commit()
    return {"success": True, "message": "Password reset successfully"}

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client-side token deletion)"""
    return {"success": True, "message": "Logged out successfully"}
