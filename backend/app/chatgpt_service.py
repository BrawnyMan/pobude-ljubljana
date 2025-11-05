import openai
import os
import json
import re
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")
client = openai.OpenAI()  

def prioritize_pobude_list(pobude_list):
    """Return list of pobude with priority scores"""
    if not pobude_list:
        return []
    
    prioritized = []
    for pobuda in pobude_list:
        try:
            prompt = f"Title: {pobuda.get('title', '')}\nDescription: {pobuda.get('description', '')}\nLocation: {pobuda.get('location', '')}"
            
            match = re.search(r"priority.*?(\d)", analysis, re.IGNORECASE)
            score = int(match.group(1)) if match else 3
            
            score_100 = int((score - 1) * 25)
            
            prioritized.append({
                **pobuda,
                "priority_score": score_100,
                "ai_analysis": analysis
            })
        except Exception as e:
            prioritized.append({
                **pobuda,
                "priority_score": 50,
                "ai_analysis": f"Analysis failed: {str(e)}"
            })
    
    prioritized.sort(key=lambda x: x["priority_score"], reverse=True)
    return prioritized

def prioritize_pobude_list_structured(pobude_list):
    """Return structured list with id and nujnost (urgency) score (0-100)"""
    if not pobude_list:
        return []
    
    pobude_for_chatgpt = []
    for pobuda in pobude_list:
        pobude_for_chatgpt.append({
            "id": pobuda.get("id"),
            "naslov": pobuda.get("naslov", pobuda.get("title", "")),
            "opis": pobuda.get("opis", pobuda.get("description", ""))
        })
    
    prompt_text = f"""Oceni nujnost naslednjih pobud in vrni strukturiran odgovor v JSON obliki.

Primer strukture odgovora:
[
  {{
    "id": <številka_pobude>,
    "nujnost": <vrednost_med_0_in_100>
  }}
]

Seznam pobud za oceno:
{json.dumps(pobude_for_chatgpt, ensure_ascii=False, indent=2)}

Vrni samo JSON array z id in nujnost za vsako pobudo. Nujnost oceni glede na resnost problema, vpliv na prebivalce in potrebo po hitri rešitvi."""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Si strokovnjak za ocenjevanje nujnosti mestnih pobud. Vračaš samo veljavne JSON objekte. Vrni odgovor kot JSON array brez dodatnega besedila."},
                {"role": "user", "content": prompt_text}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        response_text = response.choices[0].message.content.strip()
        
        try:
            result = json.loads(response_text)
        except json.JSONDecodeError:
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']')
            
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                response_text = response_text[start_idx:end_idx + 1]
                try:
                    result = json.loads(response_text)
                except json.JSONDecodeError:
                    raise ValueError("Could not parse JSON from response")
            else:
                raise ValueError("Could not find JSON array in response")
        
        if isinstance(result, dict):    
            for key, value in result.items():
                if isinstance(value, list):
                    result = value
                    break
        
        if not isinstance(result, list):
            raise ValueError("Response is not a list")
        
        prioritized = []
        for item in result:
            if "id" in item and "nujnost" in item:
                nujnost = int(item["nujnost"])
                nujnost = max(0, min(100, nujnost))
                prioritized.append({
                    "id": int(item["id"]),
                    "nujnost": nujnost
                })
        return prioritized
    except Exception as e:
        print(f"Error in ChatGPT prioritization: {str(e)}")
        return [
            {
                "id": pobuda.get("id"),
                "nujnost": 50
            }
            for pobuda in pobude_list
        ] 