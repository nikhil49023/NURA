# VitaSync Implementation Plan

VitaSync is a premium health-tech application that bridges medical data with daily nutrition using Ayurveda and AI. This project directly addresses the challenge of helping individuals make better food choices by leveraging personal health data, behavioral inputs (pantry inventory), and contextual intelligence (Ayurveda).

## 🎯 Challenge Alignment
- **Leveraging Available Data**: Scans and parses medical lab reports (HbA1c, Cholesterol) to create a baseline.
- **Contextual Inputs**: Uses Ayurvedic principles (Dosha, seasonality) as a personalized reasoning layer.
- **User Behavior/Context**: "Cook with what I have" uses real-time pantry inventory to suggest healthier alternatives.
- **Better Food Choices**: Barcode scanner provides immediate "Eat/Caution/Avoid" verdicts based on the user's specific health markers.

## 🏗️ Architecture Overview (Cloud-Native)
- **Backend**: FastAPI (Python) - Containerized on **Google Cloud Run**.
- **Frontend**: React (Vite) - Containerized on **Google Cloud Run**.
- **Intelligence**: Gemini 1.5 Flash (Reasoning), Google Cloud Vision (OCR).
- **Data**: Firestore (NoSQL) for user states, Cloud Storage for artifacts.
- **Orchestration**: Cloud Build for CI/CD.

## 🚀 Phase 1: Backend Foundation (FastAPI) [IN PROGRESS]
- [x] Initialize `vitasync-backend` with Docker support.
- [x] Implement API Routes:
    - `POST /api/v1/scan-report`: Image/PDF -> Structured Health Markers.
    - `POST /api/v1/analyze-barcode`: Barcode -> Ingredient Verdict.
    - `POST /api/v1/suggest-recipes`: Ingredients -> Ayurveda-ranked recipes.
- [ ] Implement `POST /api/v1/meal-plan`: Markers -> Weekly personalized plan.
- [x] Setup Gemini prompt engineering for "Ayurveda Reasoning Layer".
- [ ] Integrate **Firestore** for storing user health profiles and scan history.

## 🎨 Phase 2: Frontend & Design System (React) [IN PROGRESS]
- [x] Initialize `vitasync-frontend` using Vite + React.
- [x] Design System (`index.css`):
    - **Colors**: Saffron (#FF9933), Leaf Green (#4CAF50), Earthy Brown (#5D4037), Cream (#FFFDD0).
    - **Typography**: Inter / Outfit for a modern feel.
    - **Glassmorphism**: Subtle translucent cards for health data.
- [x] Create Core Components:
    - `HealthMarkerCard`: Visualizes HbA1c, Cholesterol, etc.
    - `VerdictBadge`: Eat / Caution / Avoid indicators.
    - `RecipeCard`: Health score and prep time.
- [ ] Implement user authentication and profile persistence.

## 🧪 Phase 3: Feature Integration
- [ ] **Module 1: Health Scanner**: Integration with Cloud Vision OCR and extraction logic.
- [ ] **Module 2: Product Scanner**: Integration with Open Food Facts API.
- [ ] **Module 3: AI Meal Engine**: Connecting backend reasoning to frontend displays.

## 🚢 Phase 4: Cloud Native Orchestration [IN PROGRESS]
- [x] Implement `cloudbuild.yaml` for automated deployment.
- [ ] Configure **Secret Manager** for `GOOGLE_API_KEY` and database credentials.
- [ ] Setup Service Accounts with least-privilege for Firestore and Vision API.
- [ ] Deploy to **Google Cloud Run** using the `NURA` project container registry.
- [x] Add smooth transitions and micro-animations for a "Premium" feel (Framer Motion).

---

## 🛠️ API Schema Preview (FastAPI)

```python
class HealthReport(BaseModel):
    markers: List[dict] # {name: "HbA1c", value: 6.2, unit: "%"}
    ayurvedic_insight: str
    recommendation: List[str]

class ProductVerdict(BaseModel):
    product_name: str
    verdict: str # "Eat" | "Caution" | "Avoid"
    reason: str
    ingredients_analysis: List[dict]
```
