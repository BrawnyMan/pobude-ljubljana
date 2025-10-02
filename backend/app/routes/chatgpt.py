from fastapi import APIRouter
from pydantic import BaseModel
from ..chatgpt_service import get_category_and_priority, get_category_only, prioritize_pobude_list
from typing import List
import re

router = APIRouter()

class InitiativeInput(BaseModel):
    title: str
    description: str

class Initiative(BaseModel):
    id: int
    title: str
    description: str
    location: str = ""

class PrioritizedInitiative(Initiative):
    priority_score: int
    ai_analysis: str = ""

@router.post("/analyze")
def analyze_initiative(data: InitiativeInput):
    """Analyze a single initiative and return category and priority"""
    full_prompt = f"Title: {data.title}\nDescription: {data.description}"
    result = get_category_and_priority(full_prompt)
    return {"analysis": result}

@router.post("/get-category")
def get_category(data: InitiativeInput):
    """Get only the category for a single initiative"""
    full_prompt = f"Title: {data.title}\nDescription: {data.description}"
    category = get_category_only(full_prompt)
    return {"category": category}

@router.post("/admin/ai-prioritize")
def ai_prioritize(initiatives: List[Initiative]):
    """Prioritize all provided pobude using ChatGPT"""
    if not initiatives:
        return []
    
    # Convert to list of dictionaries for the service function
    pobude_list = []
    for initiative in initiatives:
        pobude_list.append({
            "id": initiative.id,
            "title": initiative.title,
            "description": initiative.description,
            "location": initiative.location
        })
    
    # Use the service function to prioritize
    prioritized = prioritize_pobude_list(pobude_list)
    
    return prioritized 