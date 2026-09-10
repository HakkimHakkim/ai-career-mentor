from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    description: Optional[str] = None
    location: Optional[str] = None
    remote_type: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: str
    experience_level: Optional[str] = None
    job_type: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class JobMatchResponse(BaseModel):
    id: str
    job_id: str
    match_score: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    skill_gap: Optional[float] = None
    match_reasons: List[str] = []
    
    class Config:
        from_attributes = True

class JobWithMatchResponse(BaseModel):
    job: JobResponse
    match: JobMatchResponse
    
    class Config:
        from_attributes = True

class ApplyJobRequest(BaseModel):
    resume_id: str
    cover_letter: Optional[str] = None

class JobApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    status: str
    applied_date: datetime
    job: Optional[JobResponse] = None
    
    class Config:
        from_attributes = True

class SaveJobRequest(BaseModel):
    notes: Optional[str] = None

class SavedJobResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    notes: Optional[str] = None
    created_at: datetime
    job: Optional[JobResponse] = None
    
    class Config:
        from_attributes = True