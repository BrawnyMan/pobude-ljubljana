from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional
from .models import LoginRequest

router = APIRouter()
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = "MBzUmxgiq2DuNaQbcuWhBao/M2+dtJoOD/thEhxA6ekDy34/HtcC0bgaqkEDQWKq"  # Change this to a secure random key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

ADMIN_USERNAME = "admin"
# Password: admin123 (hashed with bcrypt)
ADMIN_PASSWORD_HASH = b'$2b$12$Op1jxXHIy1qpgFobqjTus.wYTjAWJZ8nyWIfgZLlMAgrEqtzWxUNG'

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return the token if valid"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username != ADMIN_USERNAME:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return token
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/api/login")
def login(request: LoginRequest):
    if request.username != ADMIN_USERNAME:
        return JSONResponse(status_code=401, content={"detail": "Invalid credentials"})
    if not bcrypt.checkpw(request.password.encode(), ADMIN_PASSWORD_HASH):
        return JSONResponse(status_code=401, content={"detail": "Invalid credentials"})
    
    # Create JWT token
    access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={"sub": request.username}, expires_delta=access_token_expires
    )
    return {"token": access_token, "token_type": "bearer"} 