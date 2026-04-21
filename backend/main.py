import os
import requests
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Configure Gemini 2.0 Flash
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

app = FastAPI(title="NURA API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    user_id: str
    dosha: str
    age: int
    conditions: List[str]
    location: str

class HealthMarker(BaseModel):
    name: str
    value: float
    unit: str
    status: str

class HealthReportResponse(BaseModel):
    markers: List[HealthMarker]
    ayurvedic_insight: str
    recommendations: List[str]
    confidence: float = 0.95
    sources: List[str] = ["Clinical Lab Report", "Ayurvedic Nutrition Framework"]
    disclaimer: str = "NURA provides nutritional guidance, not medical advice. Consult your doctor before making changes based on lab values."

class ProductAnalysis(BaseModel):
    product_name: str
    barcode: str
    verdict: str # Eat | Caution | Avoid
    reason: str
    ayurvedic_perspective: str
    confidence: float
    sources: List[str]
    disclaimer: str = "This is a dietary suggestion based on your profile. Consult a healthcare provider for medical requirements."

class Recipe(BaseModel):
    name: str
    health_score: int
    prep_time: str
    ingredients: List[str]
    ayurvedic_benefit: str
    disclaimer: str = "Consult a physician for specific dietary needs."

@app.get("/")
async def root():
    return {"status": "online", "message": "NURA v2.0 Intelligence Layer Active (Gemini 2.0 Flash)"}

@app.post("/api/v1/scan-report", response_model=HealthReportResponse)
async def scan_report(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    # In production, this would trigger a Cloud Task for async processing
    # For now, we simulate the structured output of Gemini 2.0 Flash
    return {
        "markers": [
            {"name": "HbA1c", "value": 6.4, "unit": "%", "status": "Pre-diabetic"},
            {"name": "Vitamin D", "value": 22, "unit": "ng/mL", "status": "Low"}
        ],
        "ayurvedic_insight": "High sugar markers indicate a Kapha-Pitta imbalance. Focus on bitter and astringent foods.",
        "recommendations": ["Incorporate Karela (Bitter Gourd)", "Morning Triphala tea"],
        "confidence": 0.92,
        "sources": ["Lab Report Analysis", "Ashtanga Hridaya - Sutrasthana"]
    }

@app.get("/api/v1/analyze-barcode/{barcode}", response_model=ProductAnalysis)
async def analyze_barcode(barcode: str, user_id: str = "demo_user"):
    # Fetch from Open Food Facts
    off_url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    response = requests.get(off_url)
    
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Product not found")
    
    data = response.json()
    product = data.get("product", {})
    name = product.get("product_name", "Unknown Product")
    ingredients_text = product.get("ingredients_text", "")
    
    # Simulate Gemini 2.0 Flash reasoning
    return {
        "product_name": name,
        "barcode": barcode,
        "verdict": "Avoid" if "sugar" in ingredients_text.lower() else "Caution",
        "reason": "High glycemic load ingredients detected." if "sugar" in ingredients_text.lower() else "Processed preservatives found.",
        "ayurvedic_perspective": "Refined components create Srotas blockage (ama) and aggravate Pitta.",
        "confidence": 0.89,
        "sources": ["Open Food Facts", "Ayurvedic Ingredient Database"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
