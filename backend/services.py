import os
import json
import google.generativeai as genai
from typing import List, Dict, Any
from prompts import AYURVEDIC_ANALYSIS_PROMPT, HEALTH_REPORT_PROMPT, RECIPE_SUGGESTION_PROMPT

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            'gemini-2.0-flash', 
            generation_config={"response_mime_type": "application/json"}
        )

    async def scan_report(self, contents: bytes, content_type: str, dosha: str) -> Dict[str, Any]:
        prompt = HEALTH_REPORT_PROMPT.format(dosha=dosha)
        response = self.model.generate_content([
            prompt,
            {"mime_type": content_type, "data": contents}
        ])
        return json.loads(response.text)

    async def analyze_product(self, name: str, ingredients_text: str, dosha: str, conditions: str) -> Dict[str, Any]:
        prompt = AYURVEDIC_ANALYSIS_PROMPT.format(
            dosha=dosha,
            conditions=conditions,
            product_name=name,
            ingredients_text=ingredients_text
        )
        response = self.model.generate_content(prompt)
        return json.loads(response.text)

    async def suggest_recipes(self, ingredients: List[str], dosha: str) -> List[Dict[str, Any]]:
        prompt = RECIPE_SUGGESTION_PROMPT.format(
            dosha=dosha,
            ingredients=", ".join(ingredients)
        )
        response = self.model.generate_content(prompt)
        return json.loads(response.text)
