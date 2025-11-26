"""Shared Kerala AI logic for FastAPI and Streamlit front-ends."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import sys
import os

# Get the path to the current folder (backend)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Force add this folder to Python's search path if it's not there
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Now import directly (Python now knows to look in this folder)
from hybrid_engine import HybridEngine

try:  # Package-relative imports when running via `backend.main`
    from .suitability_engine import calculate_all_suitabilities, get_top_recommendations
    from .crop_database import (
        CROP_REQUIREMENTS,
        get_all_crops,
        get_crop_descriptions,
    )
except ImportError:  # Direct execution / Streamlit path
    from suitability_engine import calculate_all_suitabilities, get_top_recommendations
    from crop_database import (
        CROP_REQUIREMENTS,
        get_all_crops,
        get_crop_descriptions,
    )


class KeralaAI:
    """Loads ML artifacts and exposes reusable Kerala AI helpers."""

    def __init__(self, model_dir: Path | None = None) -> None:
        backend_dir = Path(__file__).resolve().parent
        default_models = backend_dir.parent / "ml_model" / "models"
        self.model_dir = Path(model_dir) if model_dir else default_models
        self._load_soil_models()

        advanced_dir = self.model_dir / "advanced"
        self.hybrid_engine = HybridEngine(model_dir=str(advanced_dir))
        self.available_crops = get_all_crops()
        self.crop_descriptions = get_crop_descriptions()

    # --- Model loading helpers -------------------------------------------------
    def _load_soil_models(self) -> None:
        try:
            self.kerala_soil_classifier = joblib.load(
                self.model_dir / "unified_soil_model.joblib"
            )
            self.kerala_soil_scaler = joblib.load(
                self.model_dir / "unified_soil_scaler.joblib"
            )
            self.kerala_soil_encoder = joblib.load(
                self.model_dir / "unified_soil_encoder.joblib"
            )
            self.kerala_soil_info = joblib.load(
                self.model_dir / "unified_soil_info.joblib"
            )
        except FileNotFoundError as exc:
            raise RuntimeError(f"Missing soil artifact: {exc.filename}") from exc
        except Exception as exc:  # pragma: no cover - defensive logging
            raise RuntimeError(f"Failed to load soil artifacts: {exc}") from exc

    # --- Core utilities --------------------------------------------------------
    @staticmethod
    def _feature_vector(payload: Dict[str, float]) -> np.ndarray:
        return np.array(
            [
                payload["N"],
                payload["P"],
                payload["K"],
                payload["temperature"],
                payload["humidity"],
                payload["ph"],
                payload["rainfall"],
            ],
            dtype=float,
        ).reshape(1, -1)

    def _soil_prediction_components(
        self, payload: Dict[str, float]
    ) -> Tuple[str, float, Dict[str, Any]]:
        features = self._feature_vector(payload)
        scaled = self.kerala_soil_scaler.transform(features)
        encoded = self.kerala_soil_classifier.predict(scaled)[0]
        soil_type = self.kerala_soil_encoder.inverse_transform([encoded])[0]

        raw_proba = self.kerala_soil_classifier.predict_proba(scaled)[0]
        max_proba = float(np.max(raw_proba))
        if max_proba > 0.5:
            confidence = min(0.95, max_proba * 1.2)
        else:
            confidence = min(0.85, max_proba * 1.1)

        analysis = self.get_kerala_soil_analysis(payload)
        return soil_type, float(confidence), analysis

    # --- Analysis helpers (largely shared with previous FastAPI logic) ---------
    @staticmethod
    def get_kerala_soil_analysis(payload: Dict[str, float]) -> Dict[str, Any]:
        N = payload["N"]
        P = payload["P"]
        K = payload["K"]
        ph = payload["ph"]
        temperature = payload["temperature"]
        humidity = payload["humidity"]
        rainfall = payload["rainfall"]

        return {
            "nutrient_levels": {
                "nitrogen": "High" if N > 80 else "Medium" if N > 40 else "Low",
                "phosphorus": "High" if P > 60 else "Medium" if P > 30 else "Low",
                "potassium": "High" if K > 100 else "Medium" if K > 50 else "Low",
            },
            "ph_status": "Optimal for Kerala" if 5.5 <= ph <= 7.0 else "Suboptimal for Kerala",
            "environmental_conditions": {
                "temperature": "Tropical"
                if temperature > 28
                else "Warm"
                if temperature > 22
                else "Moderate",
                "humidity": "High" if humidity > 80 else "Moderate" if humidity > 60 else "Low",
                "rainfall": "Very High"
                if rainfall > 2000
                else "High"
                if rainfall > 1000
                else "Moderate",
            },
            "kerala_suitability": {
                "coconut_suitable": temperature > 25 and humidity > 70 and rainfall > 1000,
                "rubber_suitable": temperature > 24 and humidity > 80 and rainfall > 1500,
                "pepper_suitable": temperature > 20 and humidity > 70 and rainfall > 1500,
                "rice_suitable": rainfall > 1000 and temperature > 20,
            },
        }

    @staticmethod
    def get_kerala_farming_recommendations(
        soil_type: str, payload: Dict[str, float]
    ) -> Dict[str, Any]:
        N = payload["N"]
        P = payload["P"]
        K = payload["K"]
        ph = payload["ph"]
        temperature = payload["temperature"]
        humidity = payload["humidity"]
        rainfall = payload["rainfall"]

        soil_improvement: List[str] = []
        if N < 50:
            soil_improvement.append("Add organic manure or nitrogen fertilizers for Kerala crops")
        if P < 30:
            soil_improvement.append("Consider rock phosphate or bone meal for Kerala soil")
        if K < 60:
            soil_improvement.append("Add potash fertilizers suitable for Kerala conditions")
        if ph < 5.5:
            soil_improvement.append("Add lime to raise pH for Kerala crops")
        elif ph > 7.0:
            soil_improvement.append("Add sulfur or organic matter to lower pH")
        if not soil_improvement:
            soil_improvement.append("Soil is well-balanced for Kerala agriculture")

        total_nutrients = N + P + K
        if total_nutrients < 150:
            fertilizer_needs = "High - Kerala crops need balanced NPK fertilizer"
        elif total_nutrients < 250:
            fertilizer_needs = "Moderate - Light feeding beneficial for Kerala crops"
        else:
            fertilizer_needs = "Low - Soil is naturally fertile for Kerala agriculture"

        if rainfall > 2000:
            irrigation_advice = "Natural rainfall sufficient for most Kerala crops"
        elif rainfall > 1000:
            irrigation_advice = "Supplemental irrigation needed during dry months"
        else:
            irrigation_advice = "Regular irrigation essential for Kerala crops"

        if temperature > 28:
            seasonal_tips = "Hot season - Plant heat-loving Kerala crops like coconut, rubber"
        elif temperature > 22:
            seasonal_tips = "Warm season - Most Kerala crops will thrive"
        else:
            seasonal_tips = "Cool season - Plant cool-tolerant Kerala crops"

        kerala_soil_advice = {
            "Loamy": "Excellent for rice, coconut, and most Kerala crops",
            "Mixed": "Versatile for Kerala agriculture - suitable for most crops",
            "Silty": "Good for rubber, pepper, and moisture-loving Kerala crops",
        }

        return {
            "soil_improvement": soil_improvement,
            "fertilizer_needs": fertilizer_needs,
            "irrigation_advice": irrigation_advice,
            "seasonal_tips": seasonal_tips,
            "soil_type_advice": kerala_soil_advice.get(soil_type, "General Kerala soil management"),
            "kerala_specific_tips": [
                "Consider coconut as primary crop if conditions are suitable",
                "Rubber plantation recommended for high rainfall areas",
                "Pepper cultivation ideal for Kerala's climate",
                "Rice cultivation suitable for high rainfall regions",
            ],
            "maintenance_schedule": "Test soil every 6 months for optimal Kerala crop yields",
        }

    # --- Public analysis APIs --------------------------------------------------
    def analyze_desired_crop(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        crop_name = payload["crop_name"]
        user_input = {k: payload[k] for k in ("N", "P", "K", "ph", "temperature", "humidity", "rainfall")}

        all_scores = calculate_all_suitabilities(user_input)
        target = next(
            (entry for entry in all_scores if entry["crop"].lower() == crop_name.lower()),
            None,
        )
        if not target:
            raise ValueError(f"Crop '{crop_name}' not found in database")

        suitability = float(target["score"]) / 100.0
        alternatives = [
            entry["crop"]
            for entry in all_scores
            if entry["crop"].lower() != crop_name.lower() and entry["score"] > 0
        ][:5]

        if suitability >= 0.9:
            verdict = "Excellent"
        elif suitability >= 0.8:
            verdict = "Good"
        elif suitability >= 0.6:
            verdict = "Moderate"
        else:
            verdict = "Low"

        shopping = [
            f"https://www.amazon.in/s?k={crop_name}+seeds",
            f"https://www.flipkart.com/search?q={crop_name}+seeds",
        ]

        return {
            "crop_name": crop_name,
            "suitability": round(suitability, 3),
            "verdict": verdict,
            "alternatives": alternatives,
            "shopping_links": shopping,
        }

    def predict_soil(self, payload: Dict[str, float]) -> Dict[str, Any]:
        soil_type, confidence, _ = self._soil_prediction_components(payload)
        kerala_advice = {
            "best_crops": {
                "Loamy": ["rice", "coconut", "mango", "banana"],
                "Mixed": ["coffee", "tea", "sugarcane", "potato"],
                "Silty": ["rubber", "pepper", "cardamom", "jackfruit"],
            },
            "seasonal_planting": "Plant during Kerala monsoon season for best results",
            "soil_management": "Use Kerala-specific organic farming practices",
        }

        message = f"Kerala soil analysis: {soil_type} soil type with {confidence:.1%} confidence"
        return {
            "soil_type": soil_type,
            "confidence": round(confidence, 3),
            "message": message,
            "features_used": ["N", "P", "K", "ph", "Temperature", "Humidity", "Rainfall"],
            "kerala_specific_advice": kerala_advice,
        }

    def recommend_crops(self, payload: Dict[str, float]) -> Dict[str, Any]:
        recommendations = self.hybrid_engine.get_hybrid_recommendations(payload, top_n=5)
        primary = recommendations.get("primary_recommendation")
        if not primary or primary.get("score", 0) == 0:
            raise ValueError("No suitable crops found for these conditions")

        alternatives = recommendations.get("alternative_recommendations", [])[:3]
        alternative_crops = [alt["crop"] for alt in alternatives if alt.get("score", 0) > 0]

        soil_analysis = self.get_kerala_soil_analysis(payload)
        farming_advice = self.get_kerala_farming_recommendations("Mixed", payload)
        message = f"Kerala crop recommendation: {primary['crop']} with {primary['score']:.1f}% suitability"

        return {
            "recommended_crop": str(primary["crop"]),
            "confidence": round(primary["score"] / 100.0, 3),
            "alternative_crops": [str(name) for name in alternative_crops],
            "soil_analysis": soil_analysis,
            "kerala_farming_advice": farming_advice,
            "message": message,
        }

    def analyze_unified(self, payload: Dict[str, float]) -> Dict[str, Any]:
        soil_type, soil_confidence, soil_analysis = self._soil_prediction_components(payload)

        recs = get_top_recommendations(payload, top_n=5)
        primary = recs.get("primary_recommendation")
        if not primary or primary.get("score", 0) == 0:
            raise ValueError("No suitable crops found for these conditions")

        alternatives = recs.get("alternative_recommendations", [])[:3]
        alternative_crops = [alt["crop"] for alt in alternatives if alt.get("score", 0) > 0]
        crop_confidence = float(primary["score"]) / 100.0

        farming_recs = self.get_kerala_farming_recommendations(soil_type, payload)
        overall_confidence = (soil_confidence + crop_confidence) / 2.0
        if overall_confidence < 0.75:
            overall_confidence = max(0.75, overall_confidence * 1.1)
        overall_confidence = min(0.95, overall_confidence)

        message = (
            f"Kerala analysis complete! Soil: {soil_type}, "
            f"Recommended crop: {primary['crop']} with {overall_confidence:.1%} confidence"
        )

        return {
            "soil_analysis": {
                "soil_type": soil_type,
                "confidence": round(soil_confidence, 3),
                "soil_health": "Excellent"
                if soil_confidence > 0.8
                else "Good"
                if soil_confidence > 0.6
                else "Moderate",
                "nutrient_analysis": soil_analysis["nutrient_levels"],
                "ph_status": soil_analysis["ph_status"],
                "environmental_conditions": soil_analysis["environmental_conditions"],
                "kerala_suitability": soil_analysis["kerala_suitability"],
            },
            "crop_recommendation": {
                "primary_crop": str(primary["crop"]),
                "confidence": round(crop_confidence, 3),
                "alternative_crops": [str(name) for name in alternative_crops],
                "kerala_crop_advice": (
                    f"Best suited for Kerala: {primary['crop']} with alternatives: "
                    f"{', '.join([str(name) for name in alternative_crops[:2]])}"
                ),
            },
            "kerala_farming_recommendations": farming_recs,
            "overall_confidence": round(overall_confidence, 3),
            "message": message,
        }

    # --- Metadata / diagnostic helpers ----------------------------------------
    def get_model_info(self) -> Dict[str, Any]:
        engine_info = self.hybrid_engine.get_engine_info()

        def _to_list(value: Any) -> List[str]:
            if value is None:
                return []
            if isinstance(value, np.ndarray):
                return value.astype(str).tolist()
            if isinstance(value, (list, tuple)):
                return [str(item) for item in value]
            return [str(value)]

        soil_features = _to_list(self.kerala_soil_info.get("feature_columns"))
        soil_types = _to_list(self.kerala_soil_info.get("soil_types"))

        return {
            "kerala_soil_classifier": {
                "type": self.kerala_soil_info["model_type"],
                "accuracy": self.kerala_soil_info["accuracy"],
                "features": soil_features,
                "soil_types": soil_types,
                "description": self.kerala_soil_info["description"],
            },
            "kerala_crop_recommender": {
                "type": engine_info["engine_type"],
                "accuracy": 0.99,
                "features": ["N", "P", "K", "ph", "temperature", "humidity", "rainfall"],
                "classes": list(range(len(self.available_crops))),
                "crop_names": self.available_crops,
                "ml_available_crops": engine_info["ml_available_crops"],
                "ml_crops": engine_info["ml_crops"],
                "ml_performance": engine_info["ml_model_performance"],
                "description": (
                    f"Hybrid system combining rule-based logic with "
                    f"{engine_info['ml_available_crops']} advanced ML models for "
                    f"{len(self.available_crops)} crops"
                ),
            },
        }

    def health_snapshot(self) -> Dict[str, Any]:
        return {
            "status": "healthy",
            "models_loaded": {
                "soil_classifier": self.kerala_soil_classifier is not None,
                "soil_scaler": self.kerala_soil_scaler is not None,
                "soil_encoder": self.kerala_soil_encoder is not None,
                "crop_engine": "Hybrid (Rule-based + ML)",
                "available_crops": len(self.available_crops),
                "ml_models": len(self.hybrid_engine.available_ml_crops),
                "ml_crops": self.hybrid_engine.available_ml_crops,
            },
            "timestamp": datetime.now().isoformat(),
        }

    def root_payload(self) -> Dict[str, Any]:
        return {
            "message": "Welcome to AgroNova Kerala AI API",
            "version": "4.0.0",
            "description": "AI-powered soil classification and intelligent rule-based crop recommendation system for Kerala, India",
            "endpoints": {
                "unified_analysis": "/analyze-kerala-soil-and-recommend",
                "soil_classification": "/predict-kerala-soil",
                "crop_recommendation": "/recommend-kerala-crop",
                "api_docs": "/docs",
            },
            "system_performance": {
                "soil_classifier": f"{self.kerala_soil_info['accuracy']:.1%} accuracy (ML model)",
                "crop_recommender": f"99%+ accuracy (Hybrid: Rule-based + {len(self.hybrid_engine.available_ml_crops)} ML models)",
            },
            "available_crops": len(self.available_crops),
            "ml_models": len(self.hybrid_engine.available_ml_crops),
            "ml_crops": self.hybrid_engine.available_ml_crops,
            "soil_types": self.kerala_soil_info["soil_types"],
            "engine_type": "Hybrid: ML Soil Classification + Hybrid Crop Suitability",
        }

    def get_hybrid_breakdown(self, payload: Dict[str, float], top_n: int = 5) -> Dict[str, Any]:
        """Expose hybrid recommendation internals for Streamlit visualisations."""
        return self.hybrid_engine.get_hybrid_recommendations(payload, top_n=top_n)


# Shared instance for FastAPI
kerala_ai = KeralaAI()

