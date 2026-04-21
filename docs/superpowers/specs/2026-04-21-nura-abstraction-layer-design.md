# NURA Abstraction Layer Design

**Date:** 2026-04-21
**Status:** Approved
**Goal:** Hide Ayurvedic terminology behind health/wellness language, prepare for Google Cloud deployment

---

## Overview

NURA currently exposes Ayurvedic concepts (dosha, Pitta/Kapha/Vata, Ayurvedic insights) directly to users. This design abstracts Ayurveda into an internal intelligence layer while presenting clean health/wellness terminology to users.

**Key Principles:**
- Ayurvedic wisdom remains the intelligence engine (backend)
- User-facing language is plain health/wellness terminology
- API fields use neutral naming
- Ready for Google Cloud Run deployment

---

## 1. API & Data Models

### Field Renaming

| Current | New |
|---------|-----|
| `dosha` | `metabolic_profile` |
| `ayurvedic_insight` | `health_insight` |
| `ayurvedic_perspective` | `wellness_analysis` |
| `ayurvedic_benefit` | `personalized_benefit` |

### Profile Types

| Current | New | User Description |
|---------|-----|------------------|
| `Pitta` | `intense` | Strong and intense digestion |
| `Kapha` | `grounded` | Steady and grounded digestion |
| `Vata` | `variable` | Variable and sensitive digestion |

### API Endpoints

All endpoints use clean parameter names:

- `POST /api/v1/scan-report?metabolic_profile=intense`
- `GET /api/v1/analyze-barcode/{barcode}?metabolic_profile=intense&conditions=...`
- `POST /api/v1/suggest-recipes?metabolic_profile=intense`
- `GET /health` (new - for Cloud Run health checks)

### Pydantic Models

```python
class HealthMarker(BaseModel):
    name: str
    value: float
    unit: str
    status: str

class HealthReportResponse(BaseModel):
    markers: List[HealthMarker]
    health_insight: str
    recommendations: List[str]
    confidence: float
    sources: List[str]

class ProductAnalysis(BaseModel):
    product_name: str
    barcode: str
    verdict: str  # Eat | Caution | Avoid
    reason: str
    wellness_analysis: str
    confidence: float
    sources: List[str]

class Recipe(BaseModel):
    name: str
    health_score: int
    prep_time: str
    ingredients: List[str]
    personalized_benefit: str
```

---

## 2. Frontend UI Changes

### Profile Quiz

**Current:** "Discover your dosha profile" with Pitta/Kapha/Vata

**New:** "Discover your metabolic profile" with plain options:

| Option | Label | Description |
|--------|-------|-------------|
| `intense` | "Strong and intense digestion" | "You process food quickly and efficiently" |
| `grounded` | "Steady and grounded digestion" | "You prefer regular meals and steady energy" |
| `variable` | "Variable and sensitive digestion" | "Your digestion varies with stress and routine" |

### UI Label Replacements

| Current | New |
|---------|-----|
| "Ayurvedic Intelligence" | "Health Intelligence" |
| "Your current profile is tuned to {dosha}" | "Your metabolic profile: {profile}" |
| "Ayurvedic insight" | "Health Insight" |
| "Ayurvedic and clinical reasoning" | "Health Analysis" |
| "Ayurvedic benefit" | "Why this helps you" |
| "dosha-aware meals" | "personalized meals" |
| "Pitta profile" | "Intense profile" |

### Component Renames

- `DoshaQuiz` → `ProfileQuiz`
- Sidebar branding: "NURA Health Intelligence"
- Product screen reasoning panel: "Health Analysis"
- Recipe cards: `personalized_benefit` with label "Why this helps"

### Frontend Types

```typescript
type Profile = 'intense' | 'grounded' | 'variable';

type ReportData = {
  health_insight: string;
  markers: Marker[];
  recommendations: string[];
};

type ProductData = {
  verdict: 'Eat' | 'Caution' | 'Avoid';
  product_name: string;
  reason: string;
  wellness_analysis: string;
  sources: string[];
  confidence: number;
};

type Recipe = {
  name: string;
  health_score: number;
  prep_time: string;
  ingredients: string[];
  personalized_benefit: string;
};
```

---

## 3. Backend Service Layer

### Internal Mapping

Service maintains internal mapping from user profiles to Ayurvedic concepts:

```python
PROFILE_TO_DOSHA = {
    "intense": "Pitta",
    "grounded": "Kapha",
    "variable": "Vata"
}
```

### Request Flow

```
User Request (metabolic_profile="intense")
    ↓
API Layer receives "intense"
    ↓
Service maps "intense" → "Pitta" internally
    ↓
Prompt uses "Pitta" for Ayurvedic reasoning
    ↓
Response translates output → Wellness terminology
    ↓
API returns clean health/wellness fields
```

### Prompt Templates (Internal)

Prompts instruct AI to use Ayurvedic reasoning but output plain wellness language:

**Product Analysis:**
```
You are NURA, an expert health intelligence system.
Analyze this product for a {dosha} metabolic constitution.
[Internal note: Dosha is for reasoning only - never mention in output]

Product: {product_name}
Ingredients: {ingredients_text}

Output JSON:
1. verdict: "Eat" | "Caution" | "Avoid"
2. reason: Plain-language nutritional explanation
3. wellness_analysis: Health implications in plain language
4. confidence: 0-1 score
```

**Health Report:**
```
Analyze this medical report for a {dosha} constitution.
Use Ayurvedic reasoning internally but output plain wellness language only.

Output JSON:
1. markers: extracted health markers
2. health_insight: Plain-language explanation
3. recommendations: 2-3 actionable steps
4. confidence: 0-1
```

**Recipe Suggestion:**
```
Suggest recipes for {ingredients} suitable for {dosha} constitution.
Output plain wellness language only.

JSON: name, health_score, prep_time, ingredients, personalized_benefit
```

### Output Sanitization

Post-processing removes any Ayurvedic terms that slip through:
- Strip: "dosha", "pitta", "kapha", "vata", "agni", "ama", "guna", "ayurvedic", "ayurveda"
- Context-aware replacements where needed

---

## 4. Google Cloud Deployment

### Architecture

```
[User Browser]
      ↓
[Firebase Hosting / Cloud CDN] → Static React App
      ↓
[Cloud Run] → FastAPI Backend
      ↓
[Secret Manager] → GOOGLE_API_KEY
[Gemini API] → AI Intelligence
[Open Food Facts] → Product Data
```

### Backend: Cloud Run

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**Requirements:**
```
fastapi>=0.100.0
uvicorn>=0.23.0
python-multipart>=0.0.6
google-generativeai>=0.3.0
pydantic>=2.0.0
python-dotenv>=1.0.0
requests>=2.31.0
gunicorn>=21.0.0
```

**Health Endpoint:**
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "nura-api"}
```

### Frontend: Firebase Hosting

**Build:**
```bash
npm run build
```

**Environment:**
```
VITE_API_BASE=https://nura-api-XXXXX-uc.a.run.app/api/v1
```

### cloudbuild.yaml

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/PROJECT_ID/nura-api', './backend']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/PROJECT_ID/nura-api']

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    args: ['gcloud', 'run', 'deploy', 'nura-api',
           '--image', 'gcr.io/PROJECT_ID/nura-api',
           '--region', 'us-central1',
           '--set-secrets', 'GOOGLE_API_KEY=projects/PROJECT_ID/secrets/google-api-key/versions/latest',
           '--allow-unauthenticated']
```

---

## 5. File Changes Summary

### Backend Files to Modify

| File | Changes |
|------|---------|
| `models.py` | Rename all field names to health/wellness terms |
| `main.py` | Update parameter names, add health endpoint, update response fields |
| `services.py` | Add profile-to-dosha mapping, add output sanitization |
| `prompts.py` | Rewrite prompts to output plain wellness language |
| `requirements.txt` | Ensure all dependencies listed |

### Backend Files to Create

| File | Purpose |
|------|---------|
| `Dockerfile` | Container configuration for Cloud Run |

### Frontend Files to Modify

| File | Changes |
|------|---------|
| `App.tsx` | Rename types, update labels, rename components |
| `App.css` | Minor label styling if needed |

### Config Files to Create

| File | Purpose |
|------|---------|
| `cloudbuild.yaml` | Cloud Build deployment pipeline |
| `frontend/.env.production` | Production API URL |
| `frontend/firebase.json` | Firebase hosting config (optional) |

---

## Success Criteria

1. **No Ayurvedic terms visible** to end users in frontend UI
2. **API responses** use only health/wellness field names
3. **Profile selection** uses plain digestion descriptions
4. **Backend deploys** successfully to Cloud Run
5. **Frontend builds** and connects to deployed backend
6. **All three features work**: Report scanning, Product analysis, Recipe suggestions