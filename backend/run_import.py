#!/usr/bin/env python3
"""
Import script for JSON data files
This script should be run from the backend directory with the virtual environment activated
"""

import os
import sys
import json
import glob
from datetime import datetime

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

try:
    from sqlmodel import Session
    from app.database import engine
    from app.models import Pobuda
except ImportError as e:
    print(f"❌ Error importing required modules: {e}")
    print("💡 Make sure to:")
    print("   1. Activate the virtual environment: venv\\Scripts\\activate (Windows) or source venv/bin/activate (Linux/Mac)")
    print("   2. Install dependencies: pip install sqlmodel fastapi uvicorn")
    sys.exit(1)

def import_json_data(clear_existing=False):
    """
    Import JSON data files into the database
    
    Args:
        clear_existing (bool): If True, clear existing data before import
    """
    # Path to JSON files (relative to the backend directory)
    json_files = glob.glob("../data/*_converted.json")
    
    if not json_files:
        print("❌ No JSON files found in ../data/ directory")
        print("💡 Make sure your JSON files are in the data/ directory with names ending in '_converted.json'")
        return
    
    print(f"📁 Found {len(json_files)} JSON files to import:")
    for file_path in json_files:
        print(f"   - {os.path.basename(file_path)}")
    
    with Session(engine) as session:
        if clear_existing:
            print("🗑️  Clearing existing data...")
            session.query(Pobuda).delete()
            session.commit()
            print("✅ Existing data cleared")
        
        total_imported = 0
        
        for file_path in json_files:
            print(f"\n🔹 Importing {os.path.basename(file_path)} ...")
            
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
                        print(f"⚠️  Error processing record: {str(e)}")
                        session.rollback()  # Rollback on individual record error
                        continue
                
                session.commit()
                total_imported += file_count
                print(f"✅ Imported {file_count} records from {os.path.basename(file_path)}")
                
            except Exception as e:
                print(f"❌ Error reading file {file_path}: {str(e)}")
                session.rollback()  # Rollback on file error
                continue
    
    print(f"\n🎉 Import completed! Total records imported: {total_imported}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Import JSON data into the database")
    parser.add_argument("--clear", action="store_true", help="Clear existing data before import")
    
    args = parser.parse_args()
    
    print("🚀 Starting data import...")
    print("📋 Current working directory:", os.getcwd())
    print("📁 Looking for JSON files in: ../data/")
    
    import_json_data(clear_existing=args.clear) 