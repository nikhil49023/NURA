# Stage 1: Build the React frontend
FROM node:22-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# Build the frontend with the API base URL pointing to the same host
RUN VITE_API_BASE_URL=/api/v1 npm run build

# Stage 2: Build the Python backend and serve both
FROM python:3.11-slim
WORKDIR /app

# Copy the backend code
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./

# Copy the built frontend static files from Stage 1
COPY --from=frontend-build /app/frontend/dist /app/static

# Expose the port Cloud Run provides
EXPOSE 8080

# Run the FastAPI app with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
