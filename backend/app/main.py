from sqlmodel import Field, SQLModel, create_engine, Session, select
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from typing import Optional, List
import shutil
import os
from datetime import datetime, timedelta
from pydantic import BaseModel
from collections import defaultdict

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
    response: Optional[str] = None
    responded_at: Optional[datetime] = None

class Pobuda(PobudaBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class PobudaCreate(BaseModel):
    title: str
    description: str
    location: str
    email: str

class PobudaResponse(BaseModel):
    response: str

class Statistics(BaseModel):
    total_pobude: int
    pending_pobude: int
    responded_pobude: int
    daily_stats: List[dict]
    response_stats: List[dict]

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

@app.get("/api/pobude/{pobuda_id}", response_model=Pobuda)
def get_pobuda(pobuda_id: int):
    with Session(engine) as session:
        pobuda = session.get(Pobuda, pobuda_id)
        if not pobuda:
            raise HTTPException(status_code=404, detail="Pobuda not found")
        return pobuda

@app.get("/api/pobude", response_model=List[Pobuda])
def get_pobude():
    with Session(engine) as session:
        pobude = session.exec(select(Pobuda)).all()
        return pobude

@app.put("/api/pobude/{pobuda_id}/respond", response_model=Pobuda)
def respond_to_pobuda(pobuda_id: int, response_data: PobudaResponse):
    with Session(engine) as session:
        pobuda = session.get(Pobuda, pobuda_id)
        if not pobuda:
            raise HTTPException(status_code=404, detail="Pobuda not found")
        
        pobuda.response = response_data.response
        pobuda.status = "odgovorjeno"
        pobuda.responded_at = datetime.utcnow()
        
        session.add(pobuda)
        session.commit()
        session.refresh(pobuda)
        return pobuda

@app.get("/api/admin/statistics", response_model=Statistics)
def get_statistics():
    with Session(engine) as session:
        # Get all pobude
        pobude = session.exec(select(Pobuda)).all()
        
        # Calculate basic statistics
        total_pobude = len(pobude)
        pending_pobude = sum(1 for p in pobude if p.status == "v obravnavi")
        responded_pobude = sum(1 for p in pobude if p.status == "odgovorjeno")
        
        # Calculate daily statistics for the last 30 days
        today = datetime.utcnow().date()
        thirty_days_ago = today - timedelta(days=30)
        
        daily_stats = []
        response_stats = []
        
        # Initialize counters for each day
        daily_counts = defaultdict(int)
        response_counts = defaultdict(int)
        
        for pobuda in pobude:
            created_date = pobuda.created_at.date()
            if created_date >= thirty_days_ago:
                daily_counts[created_date] += 1
            
            if pobuda.responded_at:
                response_date = pobuda.responded_at.date()
                if response_date >= thirty_days_ago:
                    response_counts[response_date] += 1
        
        # Format daily statistics
        for i in range(30):
            date = today - timedelta(days=i)
            daily_stats.append({
                "date": date.isoformat(),
                "count": daily_counts[date]
            })
            response_stats.append({
                "date": date.isoformat(),
                "count": response_counts[date]
            })
        
        # Reverse the lists to show oldest to newest
        daily_stats.reverse()
        response_stats.reverse()
        
        return Statistics(
            total_pobude=total_pobude,
            pending_pobude=pending_pobude,
            responded_pobude=responded_pobude,
            daily_stats=daily_stats,
            response_stats=response_stats
        )
