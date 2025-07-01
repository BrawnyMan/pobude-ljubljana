from fastapi import APIRouter
from fastapi.responses import JSONResponse
import bcrypt
from .models import LoginRequest

router = APIRouter()

# Hardcoded admin credentials
ADMIN_USERNAME = "admin"
# Password: admin123 (hashed with bcrypt)
ADMIN_PASSWORD_HASH = b'$2b$12$Op1jxXHIy1qpgFobqjTus.wYTjAWJZ8nyWIfgZLlMAgrEqtzWxUNG'

@router.post("/api/login")
def login(request: LoginRequest):
    if request.username != ADMIN_USERNAME:
        return JSONResponse(status_code=401, content={"detail": "Invalid credentials"})
    if not bcrypt.checkpw(request.password.encode(), ADMIN_PASSWORD_HASH):
        return JSONResponse(status_code=401, content={"detail": "Invalid credentials"})
    # Return a dummy token (in production, use JWT)
    return {"token": "dummy-admin-token"} 