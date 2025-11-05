from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import json
import glob
from sqlmodel import Session
from datetime import datetime
from .database import reset_database, create_tables, engine
from .models import Pobuda
from .pobuda import router as pobuda_router
from .auth import router as auth_router
from .statistics import router as statistics_router
from .categories import get_categories

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to ensure CORS headers are always added"""
    origin = request.headers.get("origin")
    cors_headers = {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }
    
    if origin in origins:
        cors_headers["Access-Control-Allow-Origin"] = origin
    
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=cors_headers
        )
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers=cors_headers
    )

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(pobuda_router)
app.include_router(auth_router)
app.include_router(statistics_router)

def import_json_data(clear_existing=False):
    """
    Import JSON data files into the database
    
    Args:
        clear_existing (bool): If True, clear existing data before import
    """
    
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
                        
                        pobuda = Pobuda(
                            title=pobuda_data["title"],
                            description=pobuda_data["description"],
                            location=pobuda_data["location"],
                            latitude=pobuda_data["latitude"],
                            longitude=pobuda_data["longitude"],
                            email=pobuda_data.get("email") or "anonymous@example.com",  
                            category=pobuda_data.get("category") or "other",  
                            status=pobuda_data.get("status") or "v obravnavi",  
                            created_at=datetime.fromisoformat(pobuda_data["created_at"]),
                            image_path=pobuda_data.get("image_path")
                        )
                        
                        if pobuda_data.get("responded_at"):
                            pobuda.responded_at = datetime.fromisoformat(pobuda_data["responded_at"])
                            pobuda.response = pobuda_data.get("response", "Hvala za vašo pobudo. Obravnavali smo jo.")
                        
                        session.add(pobuda)
                        file_count += 1
                    except Exception as e:
                        print(f"Error processing record: {str(e)}")
                        session.rollback()  
                        continue

                session.commit()
                total_imported += file_count
            except Exception as e:
                session.rollback()  
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

@app.get("/api/categories")
async def get_categories_endpoint():
    """Get list of all available categories"""
    return get_categories()

@app.get("/api/import-status")
async def get_import_status():
    """
    Get information about available JSON files and current database status
    """
    try:
        
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
        
        with Session(engine) as session:
            total_records = session.query(Pobuda).count()
        
        return {
            "available_files": file_info,
            "database_records": total_records,
            "total_files": len(json_files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting import status: {str(e)}")