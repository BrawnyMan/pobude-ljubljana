from fastapi import FastAPI
from sqlmodel import Field, SQLModel, create_engine, Session, select
from typing import Optional, List
import random
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Pobuda(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    naslov: str
    vsebina: str
    status: Optional[str] = "v obravnavi"

DATABASE_URL = "sqlite:///pobude.db"
engine = create_engine(DATABASE_URL, echo=True)

SQLModel.metadata.create_all(engine)

@app.post("/ustvari-nakljucno", response_model=Pobuda)
def ustvari_nakljucno_pobudo():
    naslovi = ["Nova kolesarska pot", "Preveč parkiranih vozil", "Slaba osvetlitev", "Zelena pobuda"]
    vsebine = [
        "Predlagam kolesarsko pot ob Ljubljanici.",
        "Premalo nadzora parkiranja v centru.",
        "Ulica ponoči ni dovolj osvetljena.",
        "Več dreves ob mestnih vpadnicah."
    ]

    nova_pobuda = Pobuda(
        naslov=random.choice(naslovi),
        vsebina=random.choice(vsebine),
        status="v obravnavi"
    )

    with Session(engine) as session:
        session.add(nova_pobuda)
        session.commit()
        session.refresh(nova_pobuda)
        return nova_pobuda

@app.get("/pobude", response_model=List[Pobuda])
def preberi_vse_pobude():
    with Session(engine) as session:
        statement = select(Pobuda)
        rezultati = session.exec(statement).all()
        return rezultati
