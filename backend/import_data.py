import json
import glob
import os
from sqlmodel import Session
from datetime import datetime
import sys

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import engine
from app.models import Pobuda

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
                        # Prepare Pobuda object
                        pobuda = Pobuda(
                            title=pobuda_data["title"],
                            description=pobuda_data["description"],
                            location=pobuda_data["location"],
                            latitude=pobuda_data["latitude"],
                            longitude=pobuda_data["longitude"],
                            email=pobuda_data.get("email", ""),
                            category=pobuda_data["category"],
                            status=pobuda_data.get("status", "v obravnavi"),
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
                        continue
                
                session.commit()
                total_imported += file_count
                print(f"✅ Imported {file_count} records from {os.path.basename(file_path)}")
                
            except Exception as e:
                print(f"❌ Error reading file {file_path}: {str(e)}")
                continue
    
    print(f"\n🎉 Import completed! Total records imported: {total_imported}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Import JSON data into the database")
    parser.add_argument("--clear", action="store_true", help="Clear existing data before import")
    
    args = parser.parse_args()
    
    print("🚀 Starting data import...")
    import_json_data(clear_existing=args.clear) 