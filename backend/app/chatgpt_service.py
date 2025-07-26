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