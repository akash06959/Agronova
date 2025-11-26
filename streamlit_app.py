"""
Streamlit front-end for Agronova's Kerala AI assistant.

This app reuses the shared backend logic (backend/kerala_ai.py) so the same
models and rule-based engines power both the FastAPI service and Streamlit UI.
"""

from __future__ import annotations

from pathlib import Path
from typing import Dict

import pandas as pd
import streamlit as st

from backend.kerala_ai import KeralaAI

st.set_page_config(
    page_title="Agronova · Kerala AI Assistant",
    page_icon="🌾",
    layout="wide",
)


@st.cache_resource(show_spinner=False)
def load_engine() -> KeralaAI:
    """Ensure heavy ML artifacts are loaded once per Streamlit session."""
    return KeralaAI()


@st.cache_data(show_spinner=False)
def load_dataset_preview(rows: int = 5) -> pd.DataFrame | None:
    dataset_path = Path(__file__).resolve().parent / "ml_model" / "datasets" / "combined" / "unified_agricultural_dataset.csv"
    if not dataset_path.exists():
        return None
    return pd.read_csv(dataset_path).head(rows)


engine = load_engine()


def sidebar_inputs() -> Dict[str, float]:
    st.sidebar.header("Field Inputs")
    st.sidebar.caption("Adjust soil nutrients and climate readings to analyse recommendations.")

    N = st.sidebar.number_input("Nitrogen (ppm)", min_value=0.0, max_value=300.0, value=90.0, step=5.0)
    P = st.sidebar.number_input("Phosphorus (ppm)", min_value=0.0, max_value=300.0, value=42.0, step=2.0)
    K = st.sidebar.number_input("Potassium (ppm)", min_value=0.0, max_value=400.0, value=35.0, step=5.0)
    ph = st.sidebar.number_input("Soil pH", min_value=3.5, max_value=10.0, value=6.3, step=0.1, format="%.1f")
    temperature = st.sidebar.number_input("Temperature (°C)", min_value=8.0, max_value=55.0, value=28.0, step=0.5)
    humidity = st.sidebar.number_input("Humidity (%)", min_value=14.0, max_value=100.0, value=75.0, step=1.0)
    rainfall = st.sidebar.number_input("Rainfall (mm)", min_value=20.0, max_value=2000.0, value=1200.0, step=20.0)

    return {
        "N": float(N),
        "P": float(P),
        "K": float(K),
        "ph": float(ph),
        "temperature": float(temperature),
        "humidity": float(humidity),
        "rainfall": float(rainfall),
    }


st.title("Agronova · Kerala Smart Agriculture")
st.write(
    "Interactively classify soils, discover hybrid crop recommendations, and inspect the ML "
    "artifacts that power Agronova—all packaged for Streamlit Cloud deployment."
)

user_input = sidebar_inputs()
tabs = st.tabs(
    [
        "Soil Classifier",
        "Hybrid Crop Recommender",
        "Unified Advisor",
        "Desired Crop Check",
        "Model & Data Insights",
    ]
)

with tabs[0]:
    st.subheader("Kerala Soil Classifier")
    st.caption("Predicts the closest soil type using the unified scikit-learn classifier.")

    if st.button("Run Soil Analysis", type="primary", key="soil_run", use_container_width=True):
        try:
            result = engine.predict_soil(user_input)
            st.success(result["message"])
            cols = st.columns(2)
            cols[0].metric("Detected Soil Type", result["soil_type"])
            cols[1].metric("Confidence", f"{result['confidence'] * 100:.1f}%")
            st.write("**Kerala Practice Tips**")
            st.json(result["kerala_specific_advice"])
        except Exception as exc:  # pragma: no cover - surfaced in UI
            st.error(f"Soil analysis failed: {exc}")

with tabs[1]:
    st.subheader("Hybrid Crop Recommendations")
    st.caption("Combines rule-based reasoning with ML regressors for 22 crops.")

    if st.button("Recommend Crops", type="primary", key="crop_run", use_container_width=True):
        try:
            result = engine.recommend_crops(user_input)
            st.success(result["message"])
            cols = st.columns(2)
            cols[0].metric("Primary Crop", result["recommended_crop"])
            cols[1].metric("Suitability", f"{result['confidence'] * 100:.1f}%")

            if result["alternative_crops"]:
                st.write("**Top Alternatives**")
                st.write(", ".join(result["alternative_crops"]))
            st.write("**Soil Snapshot**")
            st.json(result["soil_analysis"])

            breakdown = engine.get_hybrid_breakdown(user_input, top_n=8)
            hybrid_table = pd.DataFrame(breakdown.get("all_recommendations", []))
            if not hybrid_table.empty:
                hybrid_table = hybrid_table[["crop", "score", "rule_score", "ml_score", "confidence_source", "reason"]]
                hybrid_table.rename(
                    columns={
                        "crop": "Crop",
                        "score": "Hybrid %",
                        "rule_score": "Rule %",
                        "ml_score": "ML %",
                        "confidence_source": "Source",
                        "reason": "Reason",
                    },
                    inplace=True,
                )
                st.dataframe(hybrid_table, use_container_width=True, hide_index=True)
        except Exception as exc:
            st.error(f"Crop recommendation failed: {exc}")

with tabs[2]:
    st.subheader("Unified Kerala Advisor")
    st.caption("Performs soil classification and crop recommendation in a single run.")

    if st.button("Run Unified Analysis", type="primary", key="unified_run", use_container_width=True):
        try:
            result = engine.analyze_unified(user_input)
            st.success(result["message"])

            cols = st.columns(3)
            cols[0].metric("Soil Type", result["soil_analysis"]["soil_type"])
            cols[1].metric("Soil Confidence", f"{result['soil_analysis']['confidence'] * 100:.1f}%")
            cols[2].metric("Overall Confidence", f"{result['overall_confidence'] * 100:.1f}%")

            st.write("**Crop Recommendation**")
            st.json(result["crop_recommendation"])
            st.write("**Kerala Farming Recommendations**")
            st.json(result["kerala_farming_recommendations"])
        except Exception as exc:
            st.error(f"Unified analysis failed: {exc}")

with tabs[3]:
    st.subheader("Desired Crop Suitability Check")
    st.caption("See how well your current conditions match a target crop.")

    default_crop_index = engine.available_crops.index("rice") if "rice" in engine.available_crops else 0
    crop_name = st.selectbox("Select Crop", options=engine.available_crops, index=default_crop_index)
    if st.button("Check Suitability", type="primary", key="desired_run", use_container_width=True):
        try:
            payload = {"crop_name": crop_name, **user_input}
            result = engine.analyze_desired_crop(payload)
            st.success(f"{result['crop_name'].title()} suitability: {result['verdict']}")
            cols = st.columns(2)
            cols[0].metric("Suitability", f"{result['suitability'] * 100:.1f}%")
            cols[1].metric("Alternatives", len(result["alternatives"]))
            if result["alternatives"]:
                st.write("**Try Also:** ", ", ".join(result["alternatives"]))
            st.write("**Seed Links**")
            for link in result["shopping_links"]:
                st.write(f"- {link}")
        except Exception as exc:
            st.error(f"Desired crop check failed: {exc}")

with tabs[4]:
    st.subheader("Model & Dataset Insights")
    metrics = engine.root_payload()
    info = engine.get_model_info()

    cols = st.columns(4)
    cols[0].metric("Available Crops", metrics["available_crops"])
    cols[1].metric("ML Crops", metrics["ml_models"])
    cols[2].metric("Soil Accuracy", f"{info['kerala_soil_classifier']['accuracy'] * 100:.1f}%")
    cols[3].metric("Engine Type", metrics["engine_type"].split(":")[0])

    st.write("**Soil Classifier**")
    st.json(info["kerala_soil_classifier"])
    st.write("**Hybrid Crop Engine**")
    st.json(info["kerala_crop_recommender"])

    dataset_preview = load_dataset_preview()
    if dataset_preview is not None:
        st.write("**Dataset Preview (first 5 rows)**")
        st.dataframe(dataset_preview, use_container_width=True)
    else:
        st.info("Dataset preview unavailable because the CSV is missing from `ml_model/datasets/combined`.") 

