# -*- coding: utf-8 -*-
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List

try:
    from .kerala_ai import kerala_ai
except ImportError:
    from kerala_ai import kerala_ai

app = FastAPI(
    title="AgroNova Kerala AI API",
    description="AI-powered soil classification and crop recommendation system for Kerala, India",
    version="4.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database and Auth setup ---
try:
    from .db import Base, engine
    from .auth import router as auth_router
    from .products import router as products_router
    from .users import router as users_router
    from .orders import router as orders_router
except ImportError:
    # Fallback for direct execution
    from db import Base, engine
    from auth import router as auth_router
    from products import router as products_router
    from users import router as users_router
    from orders import router as orders_router

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(users_router)
app.include_router(orders_router)

# Pydantic models for Kerala conditions
class KeralaSoilRequest(BaseModel):
    N: float = Field(..., ge=0, le=300, description="Nitrogen content (0-300 ppm)")
    P: float = Field(..., ge=0, le=300, description="Phosphorus content (0-300 ppm)")
    K: float = Field(..., ge=0, le=400, description="Potassium content (0-400 ppm)")
    ph: float = Field(..., ge=3.5, le=10.0, description="Soil pH (3.5-10.0)")
    temperature: float = Field(..., ge=8, le=55, description="Temperature in Celsius (8-55°C)")
    humidity: float = Field(..., ge=14, le=100, description="Humidity percentage (14-100%)")
    rainfall: float = Field(..., ge=20, le=2000, description="Rainfall in mm (20-2000mm)")

    @validator('ph')
    def ph_range(cls, v):
        if not (3.5 <= v <= 10.0):
            raise ValueError('pH must be between 3.5 and 10.0')
        return v

class KeralaSoilResponse(BaseModel):
    soil_type: str
    confidence: float
    message: str
    features_used: List[str]
    kerala_specific_advice: dict

class KeralaCropRequest(BaseModel):
    N: float = Field(..., ge=0, le=300, description="Nitrogen content (0-300 ppm)")
    P: float = Field(..., ge=5, le=300, description="Phosphorus content (5-300 ppm)")
    K: float = Field(..., ge=5, le=400, description="Potassium content (5-400 ppm)")
    ph: float = Field(..., ge=3.5, le=10.0, description="Soil pH (3.5-10.0)")
    temperature: float = Field(..., ge=8, le=55, description="Temperature in Celsius (8-55°C)")
    humidity: float = Field(..., ge=14, le=100, description="Humidity percentage (14-100%)")
    rainfall: float = Field(..., ge=20, le=2000, description="Rainfall in mm (20-2000mm)")

class KeralaCropResponse(BaseModel):
    recommended_crop: str
    confidence: float
    alternative_crops: List[str]
    soil_analysis: dict
    kerala_farming_advice: dict
    message: str

class KeralaUnifiedRequest(BaseModel):
    N: float = Field(..., ge=0, le=300, description="Nitrogen content (0-300 ppm)")
    P: float = Field(..., ge=5, le=300, description="Phosphorus content (5-300 ppm)")
    K: float = Field(..., ge=5, le=400, description="Potassium content (5-400 ppm)")
    ph: float = Field(..., ge=3.5, le=10.0, description="Soil pH (3.5-10.0)")
    temperature: float = Field(..., ge=8, le=55, description="Temperature in Celsius (8-55°C)")
    humidity: float = Field(..., ge=14, le=100, description="Humidity percentage (14-100%)")
    rainfall: float = Field(..., ge=20, le=2000, description="Rainfall in mm (20-2000mm)")

class KeralaUnifiedResponse(BaseModel):
    soil_analysis: dict
    crop_recommendation: dict
    kerala_farming_recommendations: dict
    overall_confidence: float
    message: str

# New: Desired crop suitability request/response
class DesiredCropRequest(BaseModel):
    crop_name: str
    N: float = Field(..., ge=0, le=300)
    P: float = Field(..., ge=5, le=300)
    K: float = Field(..., ge=5, le=400)
    ph: float = Field(..., ge=3.5, le=10.0)
    temperature: float = Field(..., ge=8, le=55)
    humidity: float = Field(..., ge=14, le=100)
    rainfall: float = Field(..., ge=20, le=2000)

class DesiredCropResponse(BaseModel):
    crop_name: str
    suitability: float
    verdict: str
    alternatives: List[str]
    shopping_links: List[str]

@app.post("/analyze-desired-crop", response_model=DesiredCropResponse)
async def analyze_desired_crop(request: DesiredCropRequest):
    """Analyze suitability of a specific desired crop using rule-based engine"""
    try:
        result = kerala_ai.analyze_desired_crop(request.model_dump())
        return DesiredCropResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Desired crop analysis failed: {str(e)}")

@app.post("/predict-kerala-soil", response_model=KeralaSoilResponse)
async def predict_kerala_soil(request: KeralaSoilRequest):
    """Predict soil type for Kerala conditions"""
    try:
        result = kerala_ai.predict_soil(request.model_dump())
        return KeralaSoilResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Kerala soil prediction failed: {str(e)}")

@app.post("/recommend-kerala-crop", response_model=KeralaCropResponse)
async def recommend_kerala_crop(request: KeralaCropRequest):
    """Recommend crops for Kerala conditions using hybrid engine"""
    try:
        result = kerala_ai.recommend_crops(request.model_dump())
        return KeralaCropResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Kerala crop recommendation failed: {str(e)}")

@app.post("/analyze-kerala-soil-and-recommend", response_model=KeralaUnifiedResponse)
async def analyze_kerala_soil_and_recommend(request: KeralaUnifiedRequest):
    """Unified Kerala analysis: Soil classification and crop recommendation using rule-based engine"""
    try:
        result = kerala_ai.analyze_unified(request.model_dump())
        return KeralaUnifiedResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Kerala unified analysis failed: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint with Kerala API information"""
    return kerala_ai.root_payload()

@app.get("/kerala-model-info")
async def kerala_model_info():
    """Get detailed information about Kerala models"""
    return kerala_ai.get_model_info()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return kerala_ai.health_snapshot()

# Admin endpoints removed

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
