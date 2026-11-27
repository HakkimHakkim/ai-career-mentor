from pydantic_settings import BaseSettings
from pydantic import field_validator, model_validator
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

    # Outbound mail (required for verification and password recovery)
    SMTP_SERVER: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_USE_TLS: bool = True
    FRONTEND_URL: str = "http://localhost:5173"
    RATE_LIMIT_EMAIL: int = 3
    
    # Grok AI
    GROK_API_KEY: str
    GROK_MODEL: str = "grok-2-1212"
    GROK_TIMEOUT: int = 60
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "docx"]
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "https://ai-career-mentor-beta.vercel.app"]
    
    # ML
    ML_MODEL_PATH: str = "./app/ml/model.joblib"
    DATASET_PATH: str = "./app/ml/dataset.csv"
    
    # Rate Limiting
    RATE_LIMIT_AI_TUTOR: int = 10
    RATE_LIMIT_QUIZ: int = 5
    RATE_LIMIT_RESUME: int = 5
    RATE_LIMIT_INTERVIEW: int = 3
    RATE_LIMIT_LOGIN: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @field_validator("ALLOWED_ORIGINS", "ALLOWED_EXTENSIONS", mode="before")
    @classmethod
    def parse_csv_settings(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @model_validator(mode="after")
    def validate_production_settings(self):
        if self.ENVIRONMENT.lower() == "production":
            if self.DEBUG:
                raise ValueError("DEBUG must be false in production")
            if len(self.SECRET_KEY) < 32 or self.SECRET_KEY.lower() in {"changeme", "your-super-secret-key-change-this-in-production"}:
                raise ValueError("A strong SECRET_KEY of at least 32 characters is required in production")
            if not self.DATABASE_URL or "user:password@" in self.DATABASE_URL or "localhost" in self.DATABASE_URL or "127.0.0.1" in self.DATABASE_URL:
                raise ValueError("A production DATABASE_URL must be configured")
            if not self.GROK_API_KEY or self.GROK_API_KEY.lower() in {"your-grok-api-key", "changeme"}:
                raise ValueError("A production GROK_API_KEY must be configured")
            if self.ALGORITHM != "HS256":
                raise ValueError("Production JWT algorithm must be HS256")
            if not self.ALLOWED_ORIGINS or any(
                not origin.startswith("https://") or "localhost" in origin or "127.0.0.1" in origin
                for origin in self.ALLOWED_ORIGINS
            ):
                raise ValueError("Production ALLOWED_ORIGINS must contain only explicit HTTPS origins")
        return self

@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()
