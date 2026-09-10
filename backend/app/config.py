from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache

class Settings(BaseSettings):
    """Application Settings"""
    
    # App
    APP_NAME: str = "AI Career Mentor"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/ai_career_mentor"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Grok AI
    GROK_API_KEY: str
    GROK_MODEL: str = "grok-2-1212"
    GROK_TIMEOUT: int = 60
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "docx"]
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # ML
    ML_MODEL_PATH: str = "./app/ml/model.joblib"
    DATASET_PATH: str = "./app/ml/dataset.csv"
    
    # Rate Limiting
    RATE_LIMIT_AI_TUTOR: int = 10
    RATE_LIMIT_RESUME: int = 5
    RATE_LIMIT_INTERVIEW: int = 3
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()