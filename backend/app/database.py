from sqlmodel import create_engine, SQLModel, Session

DATABASE_URL = "sqlite:///pobude.db"
engine = create_engine(DATABASE_URL, echo=True)

# Drop all tables and create new ones (for dev/demo only)
def reset_database():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

def create_tables():
    """Create all tables with current schema"""
    # Import models to ensure they're registered with SQLModel
    from .models import Pobuda
    SQLModel.metadata.create_all(engine) 