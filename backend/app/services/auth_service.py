from sqlalchemy.orm import Session
from app.models.user import User, UserProfile
from app.schemas.auth import RegisterRequest, LoginRequest
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token
)
from datetime import timedelta
from fastapi import HTTPException, status

class AuthService:
    """Authentication service"""
    
    @staticmethod
    def register(db: Session, request: RegisterRequest) -> User:
        """Register new user"""
        # Check if user exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user = User(
            name=request.name,
            email=request.email,
            password_hash=hash_password(request.password)
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create profile
        profile = UserProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        
        return user
    
    @staticmethod
    def login(db: Session, request: LoginRequest) -> tuple:
        """Login user and return tokens"""
        user = db.query(User).filter(User.email == request.email).first()
        
        if not user or not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Create tokens
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.id},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(data={"sub": user.id})
        
        return user, access_token, refresh_token
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> User:
        """Get user by ID"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    
    @staticmethod
    def update_profile(db: Session, user_id: str, profile_data: dict) -> UserProfile:
        """Update user profile"""
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            profile = UserProfile(user_id=user_id)
            db.add(profile)
        
        for key, value in profile_data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        
        db.commit()
        db.refresh(profile)
        return profile
    
    @staticmethod
    def verify_email(db: Session, user_id: str) -> User:
        """Mark email as verified"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_verified = True
            db.commit()
            db.refresh(user)
        return user
    
    @staticmethod
    def deactivate_user(db: Session, user_id: str) -> User:
        """Deactivate user account"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_active = False
            db.commit()
            db.refresh(user)
        return user