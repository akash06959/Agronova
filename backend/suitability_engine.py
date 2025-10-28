"""
Intelligent Crop Suitability Engine
Rule-based system that calculates suitability scores for all crops
"""

from typing import Dict, List, Tuple
from crop_database import CROP_REQUIREMENTS, get_all_crops

def calculate_suitability_score(user_input: Dict, crop_name: str, requirements: Dict) -> Tuple[float, str]:
    """
    Calculate suitability score for a single crop based on user input
    
    Args:
        user_input: Dictionary with N, P, K, temperature, humidity, ph, rainfall
        crop_name: Name of the crop
        requirements: Crop requirements from database
    
    Returns:
        Tuple of (score, reason)
    """
    
    # Extract user values
    user_N = user_input.get("N", 0)
    user_P = user_input.get("P", 0)
    user_K = user_input.get("K", 0)
    user_temp = user_input.get("temperature", 0)
    user_humidity = user_input.get("humidity", 0)
    user_ph = user_input.get("ph", 0)
    user_rainfall = user_input.get("rainfall", 0)
    
    # Extract crop requirements
    req_N = requirements["N"]
    req_P = requirements["P"]
    req_K = requirements["K"]
    req_temp = requirements["temp"]
    req_humidity = requirements["humidity"]
    req_ph = requirements["pH"]
    req_rainfall = requirements["rainfall"]
    
    # Start with perfect score
    score = 100.0
    reasons = []
    
    # FATAL FLAW CHECKS - These give 0% score immediately
    fatal_flaws = []
    
    # Check Potassium (K) - Critical for most crops
    if user_K < (req_K[0] * 0.2):  # Less than 20% of minimum requirement (very lenient)
        fatal_flaws.append(f"Potassium too low: {user_K} (needs {req_K[0]}+)")
    
    # Check Nitrogen (N) - Critical for growth
    if user_N < (req_N[0] * 0.4):  # Less than 40% of minimum requirement
        fatal_flaws.append(f"Nitrogen too low: {user_N} (needs {req_N[0]}+)")
    
    # Check Phosphorus (P) - Critical for root development
    if user_P < (req_P[0] * 0.4):  # Less than 40% of minimum requirement
        fatal_flaws.append(f"Phosphorus too low: {user_P} (needs {req_P[0]}+)")
    
    # Check pH - Critical for nutrient availability
    if user_ph < (req_ph[0] - 1.0) or user_ph > (req_ph[1] + 1.0):
        fatal_flaws.append(f"pH unsuitable: {user_ph} (needs {req_ph[0]}-{req_ph[1]})")
    
    # Check Temperature - Critical for growth
    if user_temp < (req_temp[0] - 5) or user_temp > (req_temp[1] + 5):
        fatal_flaws.append(f"Temperature unsuitable: {user_temp}°C (needs {req_temp[0]}-{req_temp[1]}°C)")
    
    # Check Rainfall - Critical for water availability
    if user_rainfall < (req_rainfall[0] * 0.3):  # Less than 30% of minimum requirement
        fatal_flaws.append(f"Rainfall too low: {user_rainfall}mm (needs {req_rainfall[0]}+mm)")
    
    # If any fatal flaws, return 0% score
    if fatal_flaws:
        return 0.0, f"FAILS: {', '.join(fatal_flaws)}"
    
    # --- 2. Calculate Penalties (if no fatal flaws) ---
    optimal_penalties = []
    if score > 0:

        # --- ENVIRONMENTAL PENALTIES (BIG PENALTIES) ---

        # Humidity Penalty (FIXED)
        h_min, h_max = req_humidity
        if not (h_min <= user_humidity <= h_max):
            score -= 40  # BIG penalty for wrong environment
            optimal_penalties.append(f"Bad Humidity: {user_humidity}% (ideal: {h_min}-{h_max}%)")

        # Temperature Penalty (FIXED)
        t_min, t_max = req_temp
        if not (t_min <= user_temp <= t_max):
            score -= 40  # BIG penalty for wrong environment
            optimal_penalties.append(f"Bad Temp: {user_temp}C (ideal: {t_min}-{t_max}C)")

        # Rainfall Penalty (FIXED)
        r_min, r_max = req_rainfall
        if not (r_min <= user_rainfall <= r_max):
            score -= 30  # BIG penalty for wrong environment
            optimal_penalties.append(f"Bad Rainfall: {user_rainfall}mm (ideal: {r_min}-{r_max}mm)")

        # --- NUTRIENT PENALTIES (SMALLER / VARIED PENALTIES) ---

        # Potassium (K) Penalty (FIXED)
        k_min, k_max = req_K
        if user_K < k_min:
            score -= 30  # BIG penalty for NOT ENOUGH K
            optimal_penalties.append(f"Low K: {user_K} ppm (ideal: {k_min}-{k_max} ppm)")
        elif user_K > k_max:
            score -= 5   # SMALL penalty for a SURPLUS
            optimal_penalties.append(f"Surplus K: {user_K} ppm (ideal: {k_min}-{k_max} ppm)")

        # Phosphorus (P) Penalty (FIXED)
        p_min, p_max = req_P
        if user_P < p_min:
            score -= 20  # Medium penalty for not enough P
            optimal_penalties.append(f"Low P: {user_P} ppm (ideal: {p_min}-{p_max} ppm)")
        elif user_P > p_max:
            score -= 5   # SMALL penalty for a SURPLUS
            optimal_penalties.append(f"Surplus P: {user_P} ppm (ideal: {p_min}-{p_max} ppm)")

        # Nitrogen (N) Penalty (FIXED)
        n_min, n_max = req_N
        if user_N < n_min:
            score -= 20
            optimal_penalties.append(f"Low N: {user_N} ppm (ideal: {n_min}-{n_max} ppm)")
        elif user_N > n_max:
            score -= 5   # SMALL penalty for a SURPLUS
            optimal_penalties.append(f"Surplus N: {user_N} ppm (ideal: {n_min}-{n_max} ppm)")
            
        # pH Penalty (FIXED)
        ph_min, ph_max = req_ph
        if not (ph_min <= user_ph <= ph_max):
            score -= 20  # Medium penalty for bad pH
            optimal_penalties.append(f"Sub-optimal pH: {user_ph} (ideal: {ph_min}-{ph_max})")
    
    # Ensure score doesn't go below 0
    score = max(0, score)
    
    # Create reason string
    if score >= 90:
        reason = "EXCELLENT match - All conditions optimal"
    elif score >= 75:
        reason = "GOOD match - Minor optimizations possible"
    elif score >= 60:
        reason = "MODERATE match - Some conditions suboptimal"
    elif score >= 40:
        reason = "POOR match - Multiple conditions unsuitable"
    else:
        reason = "UNSUITABLE - Major conditions missing"
    
    if optimal_penalties:
        reason += f" | Issues: {', '.join(optimal_penalties[:3])}"  # Show first 3 issues
    
    return round(score, 1), reason

def calculate_all_suitabilities(user_input: Dict) -> List[Dict]:
    """
    Calculate suitability scores for all crops
    
    Args:
        user_input: Dictionary with soil and climate parameters
    
    Returns:
        List of dictionaries with crop, score, and reason
    """
    results = []
    
    for crop_name, requirements in CROP_REQUIREMENTS.items():
        score, reason = calculate_suitability_score(user_input, crop_name, requirements)
        
        results.append({
            "crop": crop_name,
            "score": score,
            "reason": reason,
            "requirements": {
                "N": requirements["N"],
                "P": requirements["P"],
                "K": requirements["K"],
                "pH": requirements["pH"],
                "temperature": requirements["temp"],
                "humidity": requirements["humidity"],
                "rainfall": requirements["rainfall"]
            }
        })
    
    # Sort by score (highest first)
    results.sort(key=lambda x: x["score"], reverse=True)
    
    return results

def get_top_recommendations(user_input: Dict, top_n: int = 5) -> Dict:
    """
    Get top N crop recommendations with detailed analysis
    
    Args:
        user_input: Dictionary with soil and climate parameters
        top_n: Number of top recommendations to return
    
    Returns:
        Dictionary with primary recommendation and alternatives
    """
    all_scores = calculate_all_suitabilities(user_input)
    
    # Get top recommendations
    top_crops = all_scores[:top_n]
    
    # Primary recommendation (highest score)
    primary = top_crops[0] if top_crops else None
    
    # Alternative recommendations
    alternatives = top_crops[1:] if len(top_crops) > 1 else []
    
    # Calculate overall confidence
    if primary and primary["score"] > 0:
        overall_confidence = min(95, primary["score"] * 1.1)  # Boost confidence slightly
    else:
        overall_confidence = 0
    
    return {
        "primary_recommendation": primary,
        "alternative_recommendations": alternatives,
        "overall_confidence": round(overall_confidence, 1),
        "total_crops_evaluated": len(all_scores),
        "suitable_crops": len([c for c in all_scores if c["score"] > 50]),
        "analysis_timestamp": "2024-01-01T00:00:00Z",  # Will be updated by API
        "model_version": "rule-based-v1.0"
    }

