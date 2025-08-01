from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import json
import glob
from sqlmodel import Session
from datetime import datetime
from .database import reset_database, create_tables, engine
from .models import Pobuda
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

def import_json_data(clear_existing=False):
    """
    Import JSON data files into the database
    
    Args:
        clear_existing (bool): If True, clear existing data before import
    """
    # Path to JSON files (relative to the backend directory)
    json_files = glob.glob("../data/*_converted.json")
    
    if not json_files:
        raise HTTPException(status_code=404, detail="No JSON files found in ../data/ directory")
    
    with Session(engine) as session:
        if clear_existing:
            session.query(Pobuda).delete()
            session.commit()
        
        total_imported = 0
        
        for file_path in json_files:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                file_count = 0
                for pobuda_data in data:
                    try:
                        # Prepare Pobuda object with default values for missing fields
                        pobuda = Pobuda(
                            title=pobuda_data["title"],
                            description=pobuda_data["description"],
                            location=pobuda_data["location"],
                            latitude=pobuda_data["latitude"],
                            longitude=pobuda_data["longitude"],
                            email=pobuda_data.get("email") or "anonymous@example.com",  # Default email if null/missing
                            category=pobuda_data.get("category") or "other",  # Use actual category from data
                            status=pobuda_data.get("status") or "v obravnavi",  # Default status
                            created_at=datetime.fromisoformat(pobuda_data["created_at"]),
                            image_path=pobuda_data.get("image_path")
                        )
                        
                        # If responded_at exists, add response
                        if pobuda_data.get("responded_at"):
                            pobuda.responded_at = datetime.fromisoformat(pobuda_data["responded_at"])
                            pobuda.response = pobuda_data.get("response", "Hvala za vašo pobudo. Obravnavali smo jo.")
                        
                        session.add(pobuda)
                        file_count += 1
                        
                    except Exception as e:
                        print(f"Error processing record: {str(e)}")
                        session.rollback()  # Rollback on individual record error
                        continue
                
                session.commit()
                total_imported += file_count
                
            except Exception as e:
                session.rollback()  # Rollback on file error
                raise HTTPException(status_code=500, detail=f"Error reading file {file_path}: {str(e)}")
    
    return {"message": f"Import completed! Total records imported: {total_imported}"}

@app.post("/api/import-data")
async def import_data_endpoint(clear_existing: bool = False):
    """
    Import JSON data files into the database
    """
    try:
        result = import_json_data(clear_existing=clear_existing)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during import: {str(e)}")

@app.get("/api/import-status")
async def get_import_status():
    """
    Get information about available JSON files and current database status
    """
    try:
        # Check for JSON files
        json_files = glob.glob("../data/*_converted.json")
        file_info = []
        
        for file_path in json_files:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    file_info.append({
                        "filename": os.path.basename(file_path),
                        "record_count": len(data)
                    })
            except Exception as e:
                file_info.append({
                    "filename": os.path.basename(file_path),
                    "error": str(e)
                })
        
        # Get database count
        with Session(engine) as session:
            total_records = session.query(Pobuda).count()
        
        return {
            "available_files": file_info,
            "database_records": total_records,
            "total_files": len(json_files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting import status: {str(e)}")
