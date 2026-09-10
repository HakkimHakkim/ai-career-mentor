from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InterviewQuestionResponse(BaseModel):
    id: str
    question_text: str
    question_type: str
    model_answer: Optional[str] = None
    tips: List[str] = []
    order: int
    
    class Config:
        from_attributes = True

class InterviewAnswerResponse(BaseModel):
    id: str
    question_id: str
    answer_text: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    strengths: List[str] = []
    improvements: List[str] = []
    
    class Config:
        from_attributes = True

class InterviewSessionResponse(BaseModel):
    id: str
    interview_type: str
    title: Optional[str] = None
    difficulty: Optional[str] = None
    total_questions: int
    questions_answered: int
    overall_score: Optional[float] = None
    performance_feedback: Optional[str] = None
    status: str
    duration_minutes: Optional[int] = None
    created_at: datetime
    questions: List[InterviewQuestionResponse] = []
    
    class Config:
        from_attributes = True

class CreateInterviewSessionRequest(BaseModel):
    interview_type: str  # technical, hr, behavioral, mock

class SubmitInterviewAnswerRequest(BaseModel):
    question_id: str
    answer_text: str

class InterviewStatsResponse(BaseModel):
    total_interviews: int
    completed_interviews: int
    average_score: float
    best_score: float
    worst_score: float
    interviews_by_type: dict