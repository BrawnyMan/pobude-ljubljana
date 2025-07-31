from sqlmodel import Field, SQLModel
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class CategoryEnum(str, Enum):
    infrastructure = "infrastructure"
    transport = "transport"
    environment = "environment"
    culture = "culture"
    education = "education"
    health = "health"
    safety = "safety"
    other = "other"

class LoginRequest(BaseModel):
    username: str
    password: str

class PobudaBase(SQLModel):
    title: str = Field(index=True)
    description: str
    location: str = Field(index=True)
    latitude: float = Field(index=True)
    longitude: float = Field(index=True)
    email: str
    category: str = Field(default="other", index=True)
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
    category: str = "other"

class PobudaResponse(BaseModel):
    response: str

class Statistics(BaseModel):
    total_pobude: int
    pending_pobude: int
    responded_pobude: int
    daily_stats: List[dict]
    response_stats: List[dict] 