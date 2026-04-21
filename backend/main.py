import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from typing import List
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from models import HealthReportResponse, ProductAnalysis, Recipe
from services import GeminiService
from external_apis import OpenFoodFactsService

load_dotenv()

app = FastAPI(
    title="NURA API", 
    version="2.0.0",
    description="Precision Health Intelligence Layer bridging Clinical Data with Ayurveda"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency Injection
def get_gemini_service():
    return GeminiService()

@app.get("/")
async def root():
    return {
        "status": "online", 
        "message": "NURA v2.0 Intelligence Layer Active",
        "engine": "Gemini 2.0 Flash"
    }

@app.post("/api/v1/scan-report", response_model=HealthReportResponse)
async def scan_report(
    file: UploadFile = File(...), 
    dosha: str = "Pitta",
    service: GeminiService = Depends(get_gemini_service)
):
    """
    Scans a medical report (image/PDF) and extracts health markers with Ayurvedic insights.
    """
    try:
        contents = await file.read()
        analysis = await service.scan_report(contents, file.content_type, dosha)
        
        return HealthReportResponse(
            markers=analysis.get("markers", []),
            ayurvedic_insight=analysis.get("ayurvedic_insight", "Analysis inconclusive."),
            recommendations=analysis.get("recommendations", []),
            confidence=analysis.get("confidence", 0.0),
            sources=["Gemini 2.0 Flash Intelligence", "Clinical Lab Data"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report analysis failed: {str(e)}")

@app.get("/api/v1/analyze-barcode/{barcode}", response_model=ProductAnalysis)
async def analyze_barcode(
    barcode: str, 
    dosha: str = "Pitta", 
    conditions: str = "None",
    service: GeminiService = Depends(get_gemini_service)
):
    """
    Analyzes a product barcode using Open Food Facts and provides an Ayurvedic verdict.
    """
    product = OpenFoodFactsService.get_product_data(barcode)
    name = product.get("product_name", "Unknown Product")
    ingredients_text = product.get("ingredients_text", "Ingredients not listed.")
    
    try:
        analysis = await service.analyze_product(name, ingredients_text, dosha, conditions)
        
        return ProductAnalysis(
            product_name=name,
            barcode=barcode,
            verdict=analysis.get("verdict", "Caution"),
            reason=analysis.get("reason", "Inconclusive analysis."),
            ayurvedic_perspective=analysis.get("ayurvedic_perspective", "Unavailable."),
            confidence=analysis.get("confidence", 0.0),
            sources=["Open Food Facts", "NURA Intelligence"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Product analysis failed: {str(e)}")

@app.post("/api/v1/suggest-recipes", response_model=List[Recipe])
async def suggest_recipes(
    ingredients: List[str], 
    dosha: str = "Pitta",
    service: GeminiService = Depends(get_gemini_service)
):
    """
    Suggests healing recipes based on available ingredients and user profile.
    """
    try:
        recipes = await service.suggest_recipes(ingredients, dosha)
        return [Recipe(**r) for r in recipes]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recipe suggestion failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Use port from environment or default to 8082
    port = int(os.getenv("PORT", 8082))
    uvicorn.run(app, host="0.0.0.0", port=port)
