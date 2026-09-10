import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db import Base, get_db
from app.models.user import User
from app.utils.security import hash_password

# Test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture
def test_user(db=None):
    """Create test user"""
    db = TestingSessionLocal()
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash=hash_password("Password123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_register():
    """Test user registration"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New User",
            "email": "newuser@example.com",
            "password": "Password123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] == True
    assert data["data"]["email"] == "newuser@example.com"

def test_login():
    """Test user login"""
    # Create user
    test_user()
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "Password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["data"]

def test_invalid_password():
    """Test login with invalid password"""
    test_user()
    
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "WrongPassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["success"] == False

def test_get_current_user():
    """Test getting current user"""
    user = test_user()
    
    # Get token
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "Password123"
        }
    )
    
    token = login_response.json()["data"]["access_token"]
    
    # Get current user
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["email"] == "test@example.com"