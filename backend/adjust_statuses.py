#!/usr/bin/env python3

import sys
import os
import random
from datetime import datetime, timedelta
from sqlmodel import Session, select

sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import engine
from app.models import Pobuda

SAMPLE_RESPONSES = [
    "Hvala za vašo pobudo. Obravnavamo problem in bomo poskusili najti rešitev. V primeru dodatnih vprašanj vas prosimo, da nas kontaktirate.",
    "Vaša pobuda je bila prenesena pristojnim službam. Izvedli bomo pregled situacije in vas obvestili o rezultatih.",
    "Zahvaljujemo se za prijavo. Vzeli smo pobudo v obravnavo in bomo ukrepanje izvedli v najkrajšem možnem času.",
    "Pobuda je bila registrirana. Pristojne službe bodo pregledale situacijo in sporočile rezultate.",
    "Hvala za vašo pobudo. Vzeli smo jo v obravnavo. Izvedli bomo pregled in ukrepanje bo izvedeno po potrebi.",
    "Vaša pobuda je bila prenesena na pristojne službe. Izvedli bomo pregled in obvestili vas o rezultatih.",
    "Zahvaljujemo se za prijavo. Pobuda je bila vzeta v obravnavo in bomo ukrepanje izvedli v najkrajšem možnem času.",
    "Pobuda je bila registrirana in prenesena pristojnim službam. Izvedli bomo pregled situacije.",
    "Hvala za vašo pobudo. Obravnavamo problem in bomo poskusili najti rešitev. Obvestili vas bomo o napredku.",
    "Vaša pobuda je bila prenesena pristojnim službam. Izvedli bomo pregled in vas obvestili o rezultatih.",
    "Zahvaljujemo se za prijavo. Vzeli smo pobudo v obravnavo in bomo ukrepanje izvedli po potrebi.",
    "Pobuda je bila registrirana. Pristojne službe bodo pregledale situacijo in sporočile rezultate.",
    "Hvala za vašo pobudo. Vzeli smo jo v obravnavo. Izvedli bomo pregled in ukrepanje bo izvedeno.",
    "Vaša pobuda je bila prenesena na pristojne službe. Izvedli bomo pregled in obvestili vas o rezultatih.",
    "Zahvaljujemo se za prijavo. Pobuda je bila vzeta v obravnavo in bomo ukrepanje izvedli.",
]

def adjust_statuses():
    """Adjust pobude statuses to keep only 10 with 'v obravnavi' status"""
    
    with Session(engine) as session:
        
        statement = select(Pobuda).where(Pobuda.status == "v obravnavi")
        pobude_in_obravnavi = session.exec(statement).all()
        
        total_count = len(pobude_in_obravnavi)
        print(f"📊 Found {total_count} pobudes with status 'v obravnavi'")
        
        if total_count <= 10:
            print(f"✅ Already have {total_count} pobudes with status 'v obravnavi' (≤ 10). No changes needed.")
            return
        
        
        pobude_sorted = sorted(pobude_in_obravnavi, key=lambda p: p.created_at, reverse=True)
        
        
        pobude_to_keep = pobude_sorted[:10]
        
        pobude_to_respond = pobude_sorted[10:]
        
        print(f"✅ Keeping {len(pobude_to_keep)} pobudes with status 'v obravnavi'")
        print(f"📝 Changing {len(pobude_to_respond)} pobudes to 'odgovorjeno'")
        
        
        updated_count = 0
        for pobuda in pobude_to_respond:
            pobuda.status = "odgovorjeno"
            pobuda.response = random.choice(SAMPLE_RESPONSES)
            
            days_ago = random.randint(1, 30)
            pobuda.responded_at = datetime.utcnow() - timedelta(days=days_ago)
            session.add(pobuda)
            updated_count += 1
        
        
        session.commit()
        
        print(f"✅ Successfully updated {updated_count} pobudes to 'odgovorjeno'")
        print(f"📊 Current status: {len(pobude_to_keep)} pobudes with 'v obravnavi'")
        
        
        statement_after = select(Pobuda).where(Pobuda.status == "v obravnavi")
        pobude_after = session.exec(statement_after).all()
        print(f"✅ Verification: {len(pobude_after)} pobudes now have status 'v obravnavi'")

if __name__ == "__main__":
    print("🔄 Adjusting pobude statuses...")
    print("=" * 50)
    adjust_statuses()
    print("=" * 50)
    print("✅ Done!")

