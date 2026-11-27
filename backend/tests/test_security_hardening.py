import io
import zipfile
from datetime import datetime, timedelta

import pytest

from app.services.resume_service import ResumeService
from app.utils.security import create_access_token, create_refresh_token, hash_password, verify_password, verify_token
from app.config import Settings, get_settings
from jose import jwt
from app.models.base import Base
from app.utils.rate_limit import enforce_rate_limit
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app


def test_resume_validation_checks_size_and_pdf_signature():
    assert ResumeService.validate_file("resume.pdf", 8, b"%PDF-1.7") == (True, "File is valid")
    assert ResumeService.validate_file("resume.pdf", 8, b"not a pdf")[0] is False
    assert ResumeService.validate_file("resume.pdf", ResumeService.MAX_FILE_SIZE + 1, b"%PDF-")[0] is False
    assert ResumeService.validate_file("../../resume.exe", 8, b"MZ")[0] is False


def test_docx_validation_requires_document_parts_and_caps_expansion():
    data = io.BytesIO()
    with zipfile.ZipFile(data, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types/>")
        archive.writestr("word/document.xml", "<document/>")
    assert ResumeService.validate_file("resume.docx", len(data.getvalue()), data.getvalue())[0]
    assert not ResumeService.validate_file("resume.docx", 5, b"PKbad")[0]


def test_password_hashing_enforces_bcrypt_byte_limit():
    with pytest.raises(ValueError):
        hash_password("x" * 73)
    assert verify_password("x" * 73, "not-a-hash") is False
    hashed = hash_password("StrongPass1")
    assert verify_password("StrongPass1", hashed)


def test_jwt_types_are_separated_and_subject_is_present():
    access = create_access_token({"sub": "user-1"})
    refresh = create_refresh_token({"sub": "user-1"})
    assert verify_token(access)["type"] == "access"
    assert verify_token(refresh)["type"] == "refresh"
    assert verify_token(create_access_token({"name": "missing-subject"})) is None
    expired = jwt.encode(
        {"sub": "user-1", "exp": datetime.utcnow() - timedelta(seconds=1)},
        get_settings().SECRET_KEY,
        algorithm=get_settings().ALGORITHM,
    )
    assert verify_token(expired) is None
    wrong_algorithm = jwt.encode(
        {"sub": "user-1", "exp": datetime.utcnow() + timedelta(minutes=1)},
        get_settings().SECRET_KEY,
        algorithm="HS384",
    )
    assert verify_token(wrong_algorithm) is None


def test_production_settings_reject_debug_and_local_origins():
    base = {
        "ENVIRONMENT": "production",
        "DEBUG": False,
        "SECRET_KEY": "x" * 40,
        "DATABASE_URL": "postgresql://app:secret@db.example/app",
        "GROK_API_KEY": "test-key",
        "ALLOWED_ORIGINS": ["https://app.example"],
    }
    Settings(_env_file=None, **base)
    with pytest.raises(ValueError):
        Settings(_env_file=None, **{**base, "DEBUG": True})
    with pytest.raises(ValueError):
        Settings(_env_file=None, **{**base, "ALLOWED_ORIGINS": ["http://localhost:5173"]})
    with pytest.raises(ValueError):
        Settings(_env_file=None, **{**base, "DATABASE_URL": "postgresql://user:password@localhost/db"})


def test_database_rate_limit_is_shared_and_enforced(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'rate.db'}")
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)()
    enforce_rate_limit(session, "user:ai", 1, 60)
    with pytest.raises(HTTPException) as error:
        enforce_rate_limit(session, "user:ai", 1, 60)
    assert error.value.status_code == 429
    session.close()
    engine.dispose()


def test_api_security_headers_are_present():
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert response.headers["x-frame-options"] == "DENY"
