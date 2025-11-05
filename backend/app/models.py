from sqlmodel import Field, SQLModel
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class CategoryEnum(str, Enum):
    
    ceste = "Ceste"
    drevesa_rastje_zelene = "Drevesa, rastje in zelene površine"
    parki_zelene = "Parki in zelenice"
    javni_red_mir = "Javni red in mir"
    delo_redarstva = "Delo Mestnega redarstva"
    vzdrzevanje_cest = "Vzdrževanje cest"
    kolesarske_poti = "Kolesarske poti"
    lpp = "LPP"
    pespoti_plocniki = "Pešpoti in pločniki"
    razno = "Razno"
    umiritev_prometa = "Umiritev prometa in varnost"
    vodovod = "Vodovod"
    kultura = "Kultura"
    delo_inspekcij = "Delo inšpekcij"
    avtobusna_postajalisca = "Avtobusna postajališča"
    oglaševanje = "Oglaševanje "
    sportne_povrsine = "Športne površine"
    mirujoci_promet = "Mirujoči promet"
    socialno_varstvo = "Socialno varstvo in zdravje"
    informatika = "Informatika"
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