from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from datetime import datetime, timedelta
from typing import List
import random
from .database import get_session
from .models import Pobuda, CategoryEnum

router = APIRouter(prefix="/api/statistics", tags=["statistics"])

# Categories for random data generation - using actual categories from data
CATEGORIES = [
    "Ceste", "Drevesa, rastje in zelene površine", "Parki in zelenice", 
    "Javni red in mir", "Delo Mestnega redarstva", "Vzdrževanje cest",
    "Kolesarske poti", "LPP", "Pešpoti in pločniki", "Razno",
    "Umiritev prometa in varnost", "Vodovod", "Kultura", "Delo inšpekcij",
    "Avtobusna postajališča", "Oglaševanje ", "Športne površine", 
    "Mirujoči promet", "Socialno varstvo in zdravje", "Informatika", "other"
]

def generate_random_category_stats():
    """Generate random category statistics for demonstration"""
    stats = []
    for category in CATEGORIES:
        total = random.randint(5, 50)
        responded = random.randint(0, total)
        pending = total - responded
        response_rate = (responded / total * 100) if total > 0 else 0
        
        stats.append({
            "category": category,
            "total": total,
            "pending": pending,
            "responded": responded,
            "response_rate": round(response_rate, 1)
        })
    return stats

def generate_random_monthly_stats():
    """Generate random monthly statistics"""
    stats = []
    for i in range(6):
        date = datetime.now() - timedelta(days=30*i)
        stats.append({
            "month": date.strftime("%Y-%m"),
            "total": random.randint(10, 100),
            "responded": random.randint(5, 80)
        })
    return stats

def generate_random_location_stats():
    """Generate random location statistics"""
    locations = [
        "Ljubljana Center", "Bežigrad", "Šiška", "Vič", "Moste",
        "Sostro", "Šentvid", "Rožnik", "Trnovo", "Polje"
    ]
    stats = []
    for location in locations:
        total = random.randint(3, 25)
        responded = random.randint(0, total)
        stats.append({
            "location": location,
            "total": total,
            "responded": responded,
            "pending": total - responded
        })
    return stats

@router.get("/public")
async def get_public_statistics(session: Session = Depends(get_session)):
    """Get public statistics for the statistics page"""
    
    # Get basic counts
    total_pobude = session.exec(select(func.count(Pobuda.id))).first() or 0
    pending_pobude = session.exec(
        select(func.count(Pobuda.id)).where(Pobuda.status == "v obravnavi")
    ).first() or 0
    responded_pobude = session.exec(
        select(func.count(Pobuda.id)).where(Pobuda.status == "odgovorjeno")
    ).first() or 0
    
    response_rate = (responded_pobude / total_pobude * 100) if total_pobude > 0 else 0
    
    # Get category statistics
    category_stats = []
    for category in CATEGORIES:
        category_total = session.exec(
            select(func.count(Pobuda.id)).where(Pobuda.category == category)
        ).first() or 0
        
        category_responded = session.exec(
            select(func.count(Pobuda.id)).where(
                Pobuda.category == category, 
                Pobuda.status == "odgovorjeno"
            )
        ).first() or 0
        
        category_pending = session.exec(
            select(func.count(Pobuda.id)).where(
                Pobuda.category == category, 
                Pobuda.status == "v obravnavi"
            )
        ).first() or 0
        
        cat_response_rate = (category_responded / category_total * 100) if category_total > 0 else 0
        
        category_stats.append({
            "category": category,
            "total": category_total,
            "pending": category_pending,
            "responded": category_responded,
            "response_rate": round(cat_response_rate, 1)
        })
    
    # If no real data, generate random data
    if total_pobude == 0:
        category_stats = generate_random_category_stats()
        monthly_stats = generate_random_monthly_stats()
        location_stats = generate_random_location_stats()
        average_response_time = random.uniform(2.5, 8.0)
    else:
        # Get monthly statistics
        monthly_stats = []
        for i in range(6):
            start_date = datetime.now() - timedelta(days=30*i)
            end_date = start_date + timedelta(days=30)
            
            monthly_total = session.exec(
                select(func.count(Pobuda.id)).where(
                    Pobuda.created_at >= start_date,
                    Pobuda.created_at < end_date
                )
            ).first() or 0
            
            monthly_responded = session.exec(
                select(func.count(Pobuda.id)).where(
                    Pobuda.created_at >= start_date,
                    Pobuda.created_at < end_date,
                    Pobuda.status == "odgovorjeno"
                )
            ).first() or 0
            
            monthly_stats.append({
                "month": start_date.strftime("%Y-%m"),
                "total": monthly_total,
                "responded": monthly_responded
            })
        
        # Get location statistics
        location_stats = []
        locations = session.exec(
            select(Pobuda.location).distinct()
        ).all()
        
        for location in locations[:10]:  # Top 10 locations
            location_total = session.exec(
                select(func.count(Pobuda.id)).where(Pobuda.location == location)
            ).first() or 0
            
            location_responded = session.exec(
                select(func.count(Pobuda.id)).where(
                    Pobuda.location == location,
                    Pobuda.status == "odgovorjeno"
                )
            ).first() or 0
            
            location_stats.append({
                "location": location,
                "total": location_total,
                "responded": location_responded,
                "pending": location_total - location_responded
            })
        
        # Calculate average response time
        responded_pobude_with_time = session.exec(
            select(Pobuda).where(
                Pobuda.status == "odgovorjeno",
                Pobuda.responded_at.is_not(None)
            )
        ).all()
        
        if responded_pobude_with_time:
            total_days = 0
            for pobuda in responded_pobude_with_time:
                if pobuda.responded_at and pobuda.created_at:
                    days = (pobuda.responded_at - pobuda.created_at).days
                    total_days += days
            
            average_response_time = total_days / len(responded_pobude_with_time)
        else:
            average_response_time = None
    
    # Find most and least problematic categories
    category_stats_sorted = sorted(category_stats, key=lambda x: x['response_rate'])
    most_problematic = category_stats_sorted[0] if category_stats_sorted else None
    least_problematic = category_stats_sorted[-1] if category_stats_sorted else None
    
    return {
        "summary": {
            "total_pobude": total_pobude,
            "pending_pobude": pending_pobude,
            "responded_pobude": responded_pobude,
            "response_rate": round(response_rate, 1),
            "average_response_time": round(average_response_time, 1) if average_response_time else None
        },
        "category_stats": category_stats,
        "monthly_stats": monthly_stats,
        "location_stats": location_stats,
        "most_problematic_category": most_problematic,
        "least_problematic_category": least_problematic
    }

@router.get("/categories")
async def get_category_statistics(session: Session = Depends(get_session)):
    """Get statistics by category"""
    stats = await get_public_statistics(session)
    return stats["category_stats"]

@router.get("/monthly")
async def get_monthly_statistics(session: Session = Depends(get_session)):
    """Get monthly statistics"""
    stats = await get_public_statistics(session)
    return stats["monthly_stats"]

@router.get("/locations")
async def get_location_statistics(session: Session = Depends(get_session)):
    """Get statistics by location"""
    stats = await get_public_statistics(session)
    return stats["location_stats"]

@router.get("/summary")
async def get_summary_statistics(session: Session = Depends(get_session)):
    """Get summary statistics"""
    stats = await get_public_statistics(session)
    return stats["summary"] 