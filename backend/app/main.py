from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .database import reset_database, create_tables
from .pobuda import router as pobuda_router
from .auth import router as auth_router
from .routes.chatgpt import router as chatgpt_router
from .statistics import router as statistics_router

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Serve static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Reset database and create tables (clears everything on startup)
# reset_database()

# Include routers
app.include_router(pobuda_router)
app.include_router(auth_router)
app.include_router(chatgpt_router)
app.include_router(statistics_router)
