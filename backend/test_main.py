import os
import json
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from main import app

client = TestClient(app)

# Mock Gemini Response
def get_mock_gemini_response(content):
    mock = MagicMock()
    mock.text = json.dumps(content)
    return mock

@pytest.fixture
def mock_gemini_service():
    with patch("services.GeminiService.scan_report") as mock_scan, \
         patch("services.GeminiService.analyze_product") as mock_analyze, \
         patch("services.GeminiService.suggest_recipes") as mock_recipes:
        yield {
            "scan_report": mock_scan,
            "analyze_product": mock_analyze,
            "suggest_recipes": mock_recipes
        }

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

@pytest.mark.asyncio
async def test_suggest_recipes_endpoint(mock_gemini_service):
    mock_gemini_service["suggest_recipes"].return_value = [{
        "name": "Healing Soup",
        "health_score": 95,
        "prep_time": "20 mins",
        "ingredients": ["water", "vegetables"],
        "ayurvedic_benefit": "Soothing"
    }]
    
    response = client.post(
        "/api/v1/suggest-recipes?dosha=Vata",
        json=["mung dal", "ginger"]
    )
    assert response.status_code == 200
    assert response.json()[0]["name"] == "Healing Soup"

@patch("external_apis.OpenFoodFactsService.get_product_data")
def test_analyze_barcode_endpoint(mock_off, mock_gemini_service):
    mock_off.return_value = {"product_name": "Test Product", "ingredients_text": "sugar, flour"}
    mock_gemini_service["analyze_product"].return_value = {
        "verdict": "Avoid",
        "reason": "Too much sugar.",
        "ayurvedic_perspective": "Aggravates Kapha.",
        "confidence": 0.9
    }
    
    response = client.get("/api/v1/analyze-barcode/123456789?dosha=Kapha")
    assert response.status_code == 200
    assert response.json()["verdict"] == "Avoid"
    assert response.json()["product_name"] == "Test Product"

def test_scan_report_endpoint(mock_gemini_service):
    mock_gemini_service["scan_report"].return_value = {
        "markers": [{"name": "Vitamin D", "value": 30, "unit": "ng/mL", "status": "Normal"}],
        "ayurvedic_insight": "Doshas are stable.",
        "recommendations": ["Maintain current diet"],
        "confidence": 0.95
    }
    
    # Create a dummy file
    file_content = b"fake report content"
    files = {"file": ("report.jpg", file_content, "image/jpeg")}
    
    response = client.post("/api/v1/scan-report?dosha=Pitta", files=files)
    assert response.status_code == 200
    assert response.json()["markers"][0]["name"] == "Vitamin D"
    assert "ayurvedic_insight" in response.json()
