#!/usr/bin/env python3
"""
Import script for JSON data files
Run this from the backend directory with your virtual environment activated.
"""

import os
import sys
import json
import glob
import random
from datetime import datetime, timedelta
from sqlmodel import Session

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

try:
    from app.database import engine
    from app.models import Pobuda
except ImportError as e:
    print(f"❌ Error importing modules: {e}")
    print("💡 Make sure to activate your virtual environment and install dependencies:")
    print("   pip install sqlmodel fastapi uvicorn")
    sys.exit(1)

LJUBLJANA_BOUNDS = {
    "min_lat": 46.001016,
    "max_lat": 46.107632,
    "min_lng": 14.411316,
    "max_lng": 14.636532
}

def generate_random_coordinates():
    lat = random.uniform(LJUBLJANA_BOUNDS["min_lat"], LJUBLJANA_BOUNDS["max_lat"])
    lng = random.uniform(LJUBLJANA_BOUNDS["min_lng"], LJUBLJANA_BOUNDS["max_lng"])
    return lat, lng

def import_json_data(clear_existing=False):
    json_files = glob.glob("../data/*_converted.json")

    if not json_files:
        print("❌ No JSON files found in ../data/")
        print("💡 Make sure your JSON files are in '../data/' and end with '_converted.json'")
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

                if not isinstance(data, list):
                    print(f"⚠️  {os.path.basename(file_path)} does not contain a list of records.")
                    continue

                total_records = len(data)
                if total_records == 0:
                    print(f"⚠️  {os.path.basename(file_path)} is empty.")
                    continue

                unanswered_count = max(1, int(total_records * 0.1))
                unanswered_indices = set(random.sample(range(total_records), unanswered_count))

                file_count = 0

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
                            responded_at = datetime.now() - timedelta(days=days_ago)
                            responded_at = responded_at.replace(
                                hour=random.randint(9, 17),
                                minute=random.randint(0, 59),
                                second=0,
                                microsecond=0
                            )
                            response = "Hvala za vašo pobudo. Obravnavali smo jo in sprejeli ustrezne ukrepe."

                        pobuda = Pobuda(
                            title=pobuda_data["title"],
                            description=pobuda_data["description"],
                            location=pobuda_data.get("location", "Ljubljana"),
                            latitude=lat,
                            longitude=lng,
                            email=pobuda_data.get("email") or "anonymous@example.com",
                            category=pobuda_data.get("category") or "other",
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
                        session.rollback()
                        continue

                session.commit()
                total_imported += file_count
                print(f"✅ Imported {file_count} records from {os.path.basename(file_path)}")
                print(f"   📊 Status breakdown: {unanswered_count} unanswered, {file_count - unanswered_count} answered")

            except Exception as e:
                print(f"❌ Error reading file {file_path}: {str(e)}")
                session.rollback()
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
