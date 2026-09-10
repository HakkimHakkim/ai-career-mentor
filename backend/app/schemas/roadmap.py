from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RoadmapStepResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    order: int
    estimated_hours: Optional[int] = None
    status: str
    completion_percentage: float
    resources: List[dict] = []
    
    class Config:
        from_attributes = True

class RoadmapResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    total_steps: int
    completed_steps: int
    overall_progress: float
    estimated_duration_days: Optional[int] = None
    learning_hours_per_week: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: datetime
    steps: List[RoadmapStepResponse] = []
    career_title: Optional[str] = None
    
    class Config:
        from_attributes = True

class GenerateRoadmapRequest(BaseModel):
    career_id: str

class CompleteStepRequest(BaseModel):
    step_id: str

class UpdateStepProgressRequest(BaseModel):
    progress: float  # 0-100

class RoadmapSummaryResponse(BaseModel):
    total_steps: int
    completed_steps: int
    overall_progress: float
    estimated_duration_days: Optional[int] = None
    next_step: Optional[RoadmapStepResponse] = None
    recent_completions: List[str] = []