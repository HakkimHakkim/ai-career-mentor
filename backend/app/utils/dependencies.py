from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db import get_db
from app.utils.security import verify_token
from app.models.user import User

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    token = credentials.credentials
    payload = verify_token(token)
    
    # Tokens issued before the access-token type claim are accepted for
    # compatibility; refresh tokens are never valid as API credentials.
    if not payload or payload.get("type", "access") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user if authenticated, else None"""
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload or payload.get("type", "access") != "access":
        return None
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    return user
