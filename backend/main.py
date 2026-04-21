import os
import requests
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI(title="NURA API", version="1.0.0")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthMarker(BaseModel):
    name: str
    value: float
    unit: str
    status: str

class HealthReportResponse(BaseModel):
    markers: List[HealthMarker]
    ayurvedic_insight: str
    recommendations: List[str]

class ProductAnalysis(BaseModel):
    product_name: str
    barcode: str
    verdict: str
    reason: str
    ayurvedic_perspective: str

class Recipe(BaseModel):
    name: str
    health_score: int
    prep_time: str
    ingredients: List[str]
    ayurvedic_benefit: str

@app.get("/")
async def root():
    return {"status": "online", "message": "NURA Intelligence Layer Active"}

@app.post("/api/v1/scan-report", response_model=HealthReportResponse)
async def scan_report(file: UploadFile = File(...)):
    # In a real app, we'd use Cloud Vision here.
    # For the MVP, we simulate extraction + Gemini Reasoning.
    prompt = """
    Extract medical markers from this lab report text. 
    Return JSON format: {markers: [{name, value, unit, status}], ayurvedic_insight: string, recommendations: [string]}
    Identify if HbA1c, Cholesterol, or Vitamin levels are abnormal.
    """
    # Simulating Gemini response for a mock report
    return {
        "markers": [
            {"name": "HbA1c", "value": 6.4, "unit": "%", "status": "Pre-diabetic"},
            {"name": "Fasting Sugar", "value": 126, "unit": "mg/dL", "status": "High"},
            {"name": "Vitamin D", "value": 22, "unit": "ng/mL", "status": "Low"}
        ],
        "ayurvedic_insight": "High sugar markers indicate a Kapha-Pitta imbalance. Focus on bitter and astringent foods.",
        "recommendations": ["Incorporate Karela (Bitter Gourd)", "Morning Triphala tea", "Avoid heavy dairy"]
    }

@app.get("/api/v1/analyze-barcode/{barcode}", response_model=ProductAnalysis)
async def analyze_barcode(barcode: str):
    # Fetch from Open Food Facts
    off_url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    response = requests.get(off_url)
    
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Product not found")
    
    data = response.json()
    product = data.get("product", {})
    name = product.get("product_name", "Unknown Product")
    ingredients_text = product.get("ingredients_text", "")
    
    # Use Gemini for Ayurvedic Perspective and Verdict
    prompt = f"""
    Analyze these ingredients for a user with 'Pre-diabetic' status: {ingredients_text}.
    Product: {name}
    Provide:
    1. Verdict: 'Eat', 'Caution', or 'Avoid'.
    2. Reason: Short health explanation.
    3. Ayurvedic Perspective: Link to Dosha or Ama.
    Output JSON: {{"verdict": "...", "reason": "...", "ayurvedic_perspective": "..."}}
    """
    
    try:
        gemini_response = model.generate_content(prompt)
        # In a real scenario, parse JSON from gemini_response.text
        # Mocking the parsed result for stability in demo
        return {
            "product_name": name,
            "barcode": barcode,
            "verdict": "Avoid" if "sugar" in ingredients_text.lower() else "Caution",
            "reason": "High glycemic load ingredients detected." if "sugar" in ingredients_text.lower() else "Processed preservatives found.",
            "ayurvedic_perspective": "Refined components create Srotas blockage (ama) and aggravate Pitta."
        }
    except Exception:
        return {
            "product_name": name,
            "barcode": barcode,
            "verdict": "Caution",
            "reason": "Product data incomplete, but processed nature suggests moderation.",
            "ayurvedic_perspective": "Viruddha Ahara (incompatible foods) often found in such processing."
        }

@app.post("/api/v1/suggest-recipes", response_model=List[Recipe])
async def suggest_recipes(ingredients: List[str]):
    ingredients_str = ", ".join(ingredients)
    prompt = f"""
    Suggest 2 healthy Ayurvedic recipes using these ingredients: {ingredients_str}.
    Prioritize recipes for someone with High Sugar markers.
    Output JSON: [{{name, health_score, prep_time, ingredients: [], ayurvedic_benefit}}]
    """
    # Mocking for speed
    return [
        {
            "name": "Methi Thepla",
            "health_score": 92,
            "prep_time": "15m",
            "ingredients": ["Fenugreek", "Whole wheat flour", "Turmeric"],
            "ayurvedic_benefit": "Fenugreek is excellent for regulating blood sugar."
        },
        {
            "name": "Spiced Buttermilk (Chaas)",
            "health_score": 85,
            "prep_time": "5m",
            "ingredients": ["Curd", "Cumin", "Ginger"],
            "ayurvedic_benefit": "Aids digestion without spiking sugar levels."
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
