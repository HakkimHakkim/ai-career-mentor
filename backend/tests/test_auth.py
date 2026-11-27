import pytest
import hashlib
from datetime import timedelta
from urllib.parse import parse_qs, urlparse
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db import Base, get_db
from app.models.user import User
from app.utils.security import hash_password
from app.utils.security import create_action_token


@pytest.fixture
def client(tmp_path):
    engine = create_engine(
        f"sqlite:///{tmp_path / 'auth-test.db'}",
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app), TestingSessionLocal
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


def create_user(session_factory, email="test@example.com"):
    db = session_factory()
    user = User(name="Test User", email=email, password_hash=hash_password("Password123"), is_verified=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user


def test_register(client, monkeypatch):
    sent = []
    monkeypatch.setattr("app.api.auth.send_security_email", lambda *args, **kwargs: sent.append(args))
    test_client, _ = client
    response = test_client.post("/api/v1/auth/register", json={
        "name": "New User", "email": "newuser@example.com", "password": "Password123"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "newuser@example.com"
    assert response.json()["is_verified"] is False
    assert len(sent) == 1
    verification_url = next(part for part in sent[0][2].split() if "/verify-email?token=" in part)
    verification_token = parse_qs(urlparse(verification_url).query)["token"][0]
    verified = test_client.post(f"/api/v1/auth/verify-email/{verification_token}")
    assert verified.status_code == 200
    login = test_client.post("/api/v1/auth/login", json={
        "email": "newuser@example.com", "password": "Password123"
    })
    assert login.status_code == 200


def test_login_and_current_user(client):
    test_client, session_factory = client
    create_user(session_factory)
    response = test_client.post("/api/v1/auth/login", json={
        "email": "test@example.com", "password": "Password123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    current = test_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert current.status_code == 200
    assert current.json()["email"] == "test@example.com"


def test_invalid_password_and_refresh_token_rejected(client):
    test_client, session_factory = client
    create_user(session_factory)
    response = test_client.post("/api/v1/auth/login", json={
        "email": "test@example.com", "password": "WrongPassword"
    })
    assert response.status_code == 401
    from app.utils.security import create_refresh_token
    refresh = create_refresh_token({"sub": "test-user"})
    rejected = test_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {refresh}"})
    assert rejected.status_code == 401


def test_unverified_user_cannot_sign_in(client):
    test_client, session_factory = client
    user = create_user(session_factory)
    db = session_factory()
    db.query(User).filter(User.id == user.id).update({"is_verified": False})
    db.commit()
    db.close()
    response = test_client.post("/api/v1/auth/login", json={
        "email": "test@example.com", "password": "Password123"
    })
    assert response.status_code == 403
    assert "verify your email" in response.json()["detail"].lower()


def test_password_reset_token_is_single_use(client):
    test_client, session_factory = client
    user = create_user(session_factory)
    db = session_factory()
    stored = db.query(User).filter(User.id == user.id).first()
    state = hashlib.sha256(stored.password_hash.encode("utf-8")).hexdigest()
    token = create_action_token(user.id, "password_reset", timedelta(minutes=30), state)
    db.close()

    first = test_client.post("/api/v1/auth/reset-password", json={
        "token": token, "password": "NewPassword123"
    })
    replay = test_client.post("/api/v1/auth/reset-password", json={
        "token": token, "password": "AnotherPassword123"
    })
    assert first.status_code == 200
    assert replay.status_code == 400
    login = test_client.post("/api/v1/auth/login", json={
        "email": "test@example.com", "password": "NewPassword123"
    })
    assert login.status_code == 200


def test_resume_download_is_owner_only(client, tmp_path, monkeypatch):
    from app.models.resume import Resume
    from app.services.resume_service import ResumeService

    test_client, session_factory = client
    owner = create_user(session_factory, "owner@example.com")
    other = create_user(session_factory, "other@example.com")
    monkeypatch.setattr(ResumeService, "UPLOAD_DIR", str(tmp_path))
    (tmp_path / "resume-private.pdf").write_bytes(b"%PDF-private")
    db = session_factory()
    resume = Resume(
        user_id=owner.id,
        original_filename="resume.pdf",
        stored_filename="resume-private.pdf",
        file_type="pdf",
        is_primary=True,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    resume_id = resume.id
    db.close()

    def token_for(email):
        return test_client.post("/api/v1/auth/login", json={
            "email": email, "password": "Password123"
        }).json()["access_token"]

    owner_response = test_client.get(
        f"/api/v1/resume/{resume_id}/download",
        headers={"Authorization": f"Bearer {token_for('owner@example.com')}"},
    )
    other_response = test_client.get(
        f"/api/v1/resume/{resume_id}/download",
        headers={"Authorization": f"Bearer {token_for('other@example.com')}"},
    )
    assert owner_response.status_code == 200
    assert owner_response.headers["cache-control"] == "private, no-store"
    assert other_response.status_code == 404
    assert test_client.get("/uploads/resume-private.pdf").status_code == 404


def test_fake_password_reset_and_verification_tokens_are_rejected(client):
    test_client, _ = client
    reset = test_client.post("/api/v1/auth/reset-password", json={
        "token": "attacker-controlled", "password": "Password123"
    })
    verify = test_client.post("/api/v1/auth/verify-email/attacker-controlled")
    assert reset.status_code == 400
    assert verify.status_code == 400
