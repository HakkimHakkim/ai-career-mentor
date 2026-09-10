from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LessonResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    order: int
    duration_minutes: Optional[int] = None
    video_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class CourseResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    duration_hours: Optional[int] = None
    estimated_weeks: Optional[int] = None
    rating: Optional[float] = None
    is_free: bool
    provider: Optional[str] = None
    lessons: List[LessonResponse] = []
    
    class Config:
        from_attributes = True

class CourseProgressResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    total_lessons: int
    lessons_completed: int
    progress_percentage: float
    status: str
    certificate_earned: bool
    created_at: datetime
    updated_at: datetime
    course: Optional[CourseResponse] = None
    
    class Config:
        from_attributes = True

class EnrollCourseRequest(BaseModel):
    course_id: str

class QuizQuestionResponse(BaseModel):
    id: str
    question_text: str
    question_type: str
    options: Optional[List[str]] = None
    order: int
    
    class Config:
        from_attributes = True

class QuizAttemptResponse(BaseModel):
    id: str
    user_id: str
    quiz_id: str
    score: Optional[int] = None
    passed: Optional[bool] = None
    attempt_number: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class LearningStatsResponse(BaseModel):
    total_courses: int
    completed_courses: int
    in_progress_courses: int
    total_lessons: int
    lessons_completed: int
    average_progress: float
    total_hours: int