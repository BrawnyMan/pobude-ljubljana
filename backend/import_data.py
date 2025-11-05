import json
import glob
import os
from sqlmodel import Session
from datetime import datetime, timedelta
import sys
import random

sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import engine
from app.models import Pobuda

LJUBLJANA_BOUNDS = {
    "min_lat": 46.001016,
    "max_lat": 46.107632,
    "min_lng": 14.411316,
    "max_lng": 14.636532
}

def generate_random_coordinates():
    """Generate random coordinates within Ljubljana bounds"""
    lat = random.uniform(LJUBLJANA_BOUNDS["min_lat"], LJUBLJANA_BOUNDS["max_lat"])
    lng = random.uniform(LJUBLJANA_BOUNDS["min_lng"], LJUBLJANA_BOUNDS["max_lng"])
    return lat, lng

def import_json_data(clear_existing=False):
    """
    Import JSON data files into the database
    
    Args:
        clear_existing (bool): If True, clear existing data before import
    """
    
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
                total_records = len(data)
                unanswered_count = max(1, int(total_records * 0.1))
                
                
                unanswered_indices = set(random.sample(range(total_records), unanswered_count))
                
                for i, pobuda_data in enumerate(data):
                    try:
                        
                        lat, lng = generate_random_coordinates()
                        
                        
                        if i in unanswered_indices:
                            status = "v obravnavi"
                            responded_at = None
                            response = None
                        else:
                            status = "odgovorjeno"
                            
                            days_ago = random.randint(1, 30)
                            responded_at = datetime.now().replace(hour=random.randint(9, 17), minute=random.randint(0, 59), second=0, microsecond=0) - timedelta(days=days_ago)
                            response = "Hvala za vašo pobudo. Obravnavali smo jo in sprejeli ustrezne ukrepe."
                        
                        
                        pobuda = Pobuda(
                            title=pobuda_data["title"],
                            description=pobuda_data["description"],
                            location=pobuda_data["location"],
                            latitude=lat,  
                            longitude=lng,  
                            email=pobuda_data.get("email", ""),
                            category=pobuda_data["category"],
                            status=status,
                            created_at=datetime.fromisoformat(pobuda_data["created_at"]),
                            image_path=pobuda_data.get("image_path"),
                            responded_at=responded_at,
                            response=response
                        )
                        
                        session.add(pobuda)
                        file_count += 1
                        
                    except Exception as e:
                        print(f"⚠️  Error processing record: {str(e)}")
                        continue
                
                session.commit()
                total_imported += file_count
                answered_count = file_count - unanswered_count
                print(f"✅ Imported {file_count} records from {os.path.basename(file_path)}")
                print(f"   📊 Status breakdown: {unanswered_count} unanswered, {answered_count} answered")
                
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