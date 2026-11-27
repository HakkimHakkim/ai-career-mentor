from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
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


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and content_length.isdigit() and int(content_length) > settings.MAX_UPLOAD_SIZE + 1024 * 1024:
            return JSONResponse(status_code=413, content={"detail": "Request body too large"})
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        if settings.ENVIRONMENT.lower() == "production":
            response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        return response


app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=600,
)

# Static files (profile photos etc.)
profile_uploads = Path(settings.UPLOAD_DIR) / "profile"
profile_uploads.mkdir(parents=True, exist_ok=True)
app.mount("/uploads/profile", StaticFiles(directory=str(profile_uploads)), name="profile-uploads")


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
    # Keep exception details in server logs only; never return DB/provider data.
    import logging
    logging.getLogger("app").exception("Unhandled request error", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG, log_level="info")
