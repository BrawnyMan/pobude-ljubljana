from sqlmodel import create_engine, SQLModel, Session

DATABASE_URL = "sqlite:///pobude.db"
engine = create_engine(DATABASE_URL, echo=True)

# Drop all tables and create new ones (for dev/demo only)
def reset_database():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine) 