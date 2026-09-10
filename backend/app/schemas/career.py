from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SkillResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    
    class Config:
        from_attributes = True

class CareerSkillResponse(BaseModel):
    skill_id: str
    importance: str
    required_level: Optional[str] = None
    skill: SkillResponse
    
    class Config:
        from_attributes = True

class CareerResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    average_learning_time: Optional[int] = None
    skills: List[CareerSkillResponse] = []
    
    class Config:
        from_attributes = True

class CareerRecommendationResponse(BaseModel):
    career: CareerResponse
    match_score: float
    rank: Optional[int] = None
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    reasons: List[str] = []
    
    class Config:
        from_attributes = True

class CareerPredictionRequest(BaseModel):
    skills: List[str]
    interests: List[str]
    experience_level: str
    education: Optional[str] = None

class UserSkillRequest(BaseModel):
    skill_id: str
    proficiency_level: str
    years_of_experience: Optional[float] = None

class UserSkillResponse(BaseModel):
    skill: SkillResponse
    proficiency_level: str
    years_of_experience: Optional[float] = None
    verified: bool
    
    class Config:
        from_attributes = True

class AssessmentAnswerRequest(BaseModel):
    question_id: str
    answer_text: str

class AssessmentSubmitRequest(BaseModel):
    assessment_id: str
    answers: List[AssessmentAnswerRequest]

class AssessmentResultResponse(BaseModel):
    assessment_id: str
    score: Optional[int] = None
    total_questions: int
    questions_answered: int
    status: str
    
    class Config:
        from_attributes = True