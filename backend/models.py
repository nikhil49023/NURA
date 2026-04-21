from pydantic import BaseModel, Field
from typing import List, Optional

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
