from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ResumeUploadResponse(BaseModel):
    id: str
    original_filename: str
    stored_filename: str
    file_type: str
    file_size: Optional[str] = None
    is_primary: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResumeAnalysisResponse(BaseModel):
    id: str
    resume_id: str
    overall_score: Optional[float] = None
    skill_match_score: Optional[float] = None
    keyword_score: Optional[float] = None
    projects_score: Optional[float] = None
    experience_score: Optional[float] = None
    extracted_name: Optional[str] = None
    extracted_email: Optional[str] = None
    extracted_phone: Optional[str] = None
    detected_skills: List[str] = []
    missing_skills: List[str] = []
    recommendations: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResumeDetailResponse(BaseModel):
    id: str
    original_filename: str
    file_type: str
    is_primary: bool
    analysis: Optional[ResumeAnalysisResponse] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class SkillGapResponse(BaseModel):
    id: str
    user_id: str
    career_id: str
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    weak_skills: List[str] = []
    priority_skills: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResumeImprovementRequest(BaseModel):
    target_career: Optional[str] = None

class ResumeImprovementResponse(BaseModel):
    strengths: List[str] = []
    improvements: List[str] = []
    missing_keywords: List[str] = []
    suggested_summary: str
    score_out_of_100: int