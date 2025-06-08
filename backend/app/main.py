from sqlmodel import Field, SQLModel, create_engine, Session, select
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from typing import Optional, List
import shutil
import os
from datetime import datetime
from pydantic import BaseModel

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

class PobudaBase(SQLModel):
    title: str = Field(index=True)
    description: str
    location: str = Field(index=True)
    latitude: float = Field(index=True)
    longitude: float = Field(index=True)
    email: str
    image_path: Optional[str] = None
    status: str = Field(default="v obravnavi", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Pobuda(PobudaBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class PobudaCreate(BaseModel):
    title: str
    description: str
    location: str
    email: str

DATABASE_URL = "sqlite:///pobude.db"
engine = create_engine(DATABASE_URL, echo=True)

# Drop all tables and create new ones
SQLModel.metadata.drop_all(engine)
SQLModel.metadata.create_all(engine)

@app.post("/api/pobude", response_model=Pobuda)
async def create_pobuda(
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    email: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    # Handle image upload
    image_path = None
    if image:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(image.filename)[1]
        filename = f"pobuda_{timestamp}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_path = f"/uploads/{filename}"

    # Create pobuda
    pobuda = Pobuda(
        title=title,
        description=description,
        location=location,
        latitude=latitude,
        longitude=longitude,
        email=email,
        image_path=image_path
    )

    with Session(engine) as session:
        session.add(pobuda)
        session.commit()
        session.refresh(pobuda)
        return pobuda

@app.get("/api/pobude", response_model=List[Pobuda])
def get_pobude():
    with Session(engine) as session:
        statement = select(Pobuda).order_by(Pobuda.created_at.desc())
        return session.exec(statement).all()

@app.get("/api/pobude/{pobuda_id}", response_model=Pobuda)
def get_pobuda(pobuda_id: int):
    with Session(engine) as session:
        pobuda = session.get(Pobuda, pobuda_id)
        if not pobuda:
            raise HTTPException(status_code=404, detail="Pobuda not found")
        return pobuda
