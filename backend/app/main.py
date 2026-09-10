from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import get_settings
from app.db import init_db

from app.api import (
    auth, career, learning, projects, resume,
    interview, ai, notifications, dashboard,
    roadmap, profile, quiz,
)

settings = get_settings()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (profile photos etc.)
Path("uploads/profile").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.on_event("startup")
async def startup():
    init_db()
    print("Database initialized")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}


app.include_router(auth.router)
app.include_router(career.router)
app.include_router(profile.router)
app.include_router(roadmap.router)
app.include_router(learning.router)
app.include_router(projects.router)
app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(ai.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)
app.include_router(quiz.router)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG, log_level="info")