import openai
import os
from dotenv import load_dotenv
from pathlib import Path

# Always load .env from the backend root
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")
client = openai.OpenAI()  # uses api_key from env by default

def get_category_and_priority(prompt_text: str):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant classifying city initiatives."},
            {"role": "user", "content": f"Analyze the following citizen initiative and return the most suitable category and a priority score from 1 (low) to 5 (high):\n\n{prompt_text}"}
        ],
        temperature=0.3,
        max_tokens=100
    )
    return response.choices[0].message.content.strip()

def get_category_only(prompt_text: str):
    """Get only the category for a given prompt"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant classifying city initiatives. Return only the category name from: infrastructure, environment, safety, social, culture, education, health, transport, other"},
            {"role": "user", "content": f"Classify this citizen initiative into one category:\n\n{prompt_text}"}
        ],
        temperature=0.3,
        max_tokens=50
    )
    return response.choices[0].message.content.strip()

def prioritize_pobude_list(pobude_list):
    """Return list of pobude with priority scores"""
    if not pobude_list:
        return []
    
    prioritized = []
    for pobuda in pobude_list:
        try:
            prompt = f"Title: {pobuda.get('title', '')}\nDescription: {pobuda.get('description', '')}\nLocation: {pobuda.get('location', '')}"
            analysis = get_category_and_priority(prompt)
            
            # Extract priority score from analysis
            import re
            match = re.search(r"priority.*?(\d)", analysis, re.IGNORECASE)
            score = int(match.group(1)) if match else 3
            # Convert 1-5 to 0-100
            score_100 = int((score - 1) * 25)
            
            prioritized.append({
                **pobuda,
                "priority_score": score_100,
                "ai_analysis": analysis
            })
        except Exception as e:
            # Fallback if analysis fails
            prioritized.append({
                **pobuda,
                "priority_score": 50,
                "ai_analysis": f"Analysis failed: {str(e)}"
            })
    
    # Sort by priority score descending
    prioritized.sort(key=lambda x: x["priority_score"], reverse=True)
    return prioritized 