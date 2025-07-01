from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from sqlmodel import Session, select
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional, List
import os, shutil
from .models import Pobuda, PobudaCreate, PobudaResponse, Statistics
from .database import engine

UPLOAD_DIR = "uploads"

router = APIRouter()

@router.post("/api/pobude", response_model=Pobuda)
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

@router.get("/api/pobude/{pobuda_id}", response_model=Pobuda)
def get_pobuda(pobuda_id: int):
    with Session(engine) as session:
        pobuda = session.get(Pobuda, pobuda_id)
        if not pobuda:
            raise HTTPException(status_code=404, detail="Pobuda not found")
        return pobuda

@router.get("/api/pobude", response_model=List[Pobuda])
def get_pobude():
    with Session(engine) as session:
        pobude = session.exec(select(Pobuda)).all()
        return pobude

@router.put("/api/pobude/{pobuda_id}/respond", response_model=Pobuda)
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

@router.get("/api/admin/statistics", response_model=Statistics)
def get_statistics():
    with Session(engine) as session:
        pobude = session.exec(select(Pobuda)).all()
        total_pobude = len(pobude)
        pending_pobude = sum(1 for p in pobude if p.status == "v obravnavi")
        responded_pobude = sum(1 for p in pobude if p.status == "odgovorjeno")
        today = datetime.utcnow().date()
        thirty_days_ago = today - timedelta(days=30)
        daily_stats = []
        response_stats = []
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
        for i in range(30):
            date = today - timedelta(days=i)
            daily_stats.append({"date": date.isoformat(), "count": daily_counts[date]})
            response_stats.append({"date": date.isoformat(), "count": response_counts[date]})
        daily_stats.reverse()
        response_stats.reverse()
        return Statistics(
            total_pobude=total_pobude,
            pending_pobude=pending_pobude,
            responded_pobude=responded_pobude,
            daily_stats=daily_stats,
            response_stats=response_stats
        ) 