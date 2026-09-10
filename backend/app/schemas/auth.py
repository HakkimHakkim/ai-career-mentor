from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from app.schemas.user import UserProfileResponse

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain digit')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

class VerifyEmailRequest(BaseModel):
    token: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    is_verified: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class CurrentUserResponse(UserResponse):
    profile: Optional[UserProfileResponse] = None