from fastapi import APIRouter
from pydantic import BaseModel
from ..chatgpt_service import get_category_and_priority
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

class PrioritizedInitiative(Initiative):
    priority_score: int

@router.post("/analyze")
def analyze_initiative(data: InitiativeInput):
    full_prompt = f"Title: {data.title}\nDescription: {data.description}"
    result = get_category_and_priority(full_prompt)
    return {"analysis": result}

@router.post("/admin/ai-prioritize")
def ai_prioritize(initiatives: List[Initiative]):
    prioritized = []
    for initiative in initiatives:
        prompt = f"Title: {initiative.title}\nDescription: {initiative.description}"
        analysis = get_category_and_priority(prompt)
        # Extract priority score from analysis (assume format: ... priority score: X ...)
        match = re.search(r"priority score.*?(\d)", analysis, re.IGNORECASE)
        score = int(match.group(1)) if match else 1
        # Convert 1-5 to 0-100
        score_100 = int((score - 1) * 25)
        prioritized.append({
            **initiative.dict(),
            "priority_score": score_100
        })
    # Sort by priority descending
    prioritized.sort(key=lambda x: x["priority_score"], reverse=True)
    return prioritized 