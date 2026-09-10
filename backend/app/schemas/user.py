from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime

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
    
    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    id: str
    user_id: str
    education: Optional[str] = None
    degree: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[str] = None
    experience_level: Optional[str] = None
    location: Optional[str] = None
    career_goal: Optional[str] = None
    interests: Optional[str] = None
    learning_hours_per_week: Optional[int] = None
    preferred_language: str
    preferred_theme: str
    remote_preference: Optional[str] = None
    bio: Optional[str] = None
    onboarding_completed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserSkillResponse(BaseModel):
    id: str
    skill_id: str
    proficiency_level: str
    years_of_experience: Optional[float] = None
    verified: bool
    skill_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserDetailResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    profile: Optional[UserProfileResponse] = None
    skills: List[UserSkillResponse] = []
    
    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain digit')
        return v