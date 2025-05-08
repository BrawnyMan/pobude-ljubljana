from sqlmodel import Field, SQLModel, create_engine, Session, select
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from typing import Optional, List

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
    title: str
    description: str
    location: str
    email: str
    captcha: Optional[str] = None
    status: Optional[str] = "v obravnavi"

DATABASE_URL = "sqlite:///pobude.db"
engine = create_engine(DATABASE_URL, echo=True)

# --- Remove database and create new one ---
# SQLModel.metadata.drop_all(engine)

SQLModel.metadata.create_all(engine)

@app.post("/pobude", response_model=Pobuda)
def dodaj_pobudo(pobuda: Pobuda):
    with Session(engine) as session:
        session.add(pobuda)
        session.commit()
        session.refresh(pobuda)
        return pobuda

@app.get("/pobude", response_model=List[Pobuda])
def preberi_pobude():
    with Session(engine) as session:
        statement = select(Pobuda)
        return session.exec(statement).all()
