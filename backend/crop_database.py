"""
Comprehensive Crop Requirements Database
Real agricultural data for 22 crops based on scientific research
"""

CROP_REQUIREMENTS = {
    "apple": {
        "N": (60, 120),      # Moderate N requirement
        "P": (30, 50),       # Moderate P requirement  
        "K": (80, 150),      # High K requirement
        "pH": (6.0, 7.0),    # Slightly acidic to neutral
        "temp": (15, 25),    # Cool temperate
        "humidity": (60, 80), # Moderate humidity
        "rainfall": (800, 1200), # Moderate rainfall
        "soil_type": ["Loamy", "Clayey"], # Prefers loamy soils
        "description": "Temperate fruit tree requiring cool climates"
    },
    
    "banana": {
        "N": (80, 150),      # High N requirement
        "P": (40, 80),       # High P requirement
        "K": (150, 300),     # Very high K requirement
        "pH": (5.5, 7.0),    # Acidic to neutral
        "temp": (26, 30),    # Tropical warm
        "humidity": (75, 85), # High humidity
        "rainfall": (1800, 2500), # High rainfall
        "soil_type": ["Loamy", "Clayey"], # Rich soils
        "description": "Tropical fruit requiring high nutrients and moisture"
    },
    
    "blackgram": {
        "N": (15, 30),       # Low N (legume - fixes nitrogen)
        "P": (20, 40),       # Moderate P
        "K": (30, 60),       # Moderate K
        "pH": (6.0, 7.5),    # Neutral to slightly alkaline
        "temp": (25, 35),    # Warm
        "humidity": (50, 70), # Moderate humidity
        "rainfall": (400, 800), # Low to moderate rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained soils
        "description": "Drought-tolerant legume crop"
    },
    
    "chickpea": {
        "N": (20, 40),       # Low N (legume)
        "P": (25, 45),       # Moderate P
        "K": (40, 80),       # Moderate K
        "pH": (6.0, 8.0),    # Neutral to alkaline
        "temp": (20, 30),    # Moderate temperature
        "humidity": (40, 60), # Low to moderate humidity
        "rainfall": (300, 600), # Low rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Drought-resistant legume"
    },
    
    "coconut": {
        "N": (100, 200),     # Very high N
        "P": (50, 100),      # High P
        "K": (200, 400),     # Very high K
        "pH": (5.5, 8.0),    # Wide pH range
        "temp": (27, 32),    # Tropical
        "humidity": (80, 90), # Very high humidity
        "rainfall": (1500, 3000), # Very high rainfall
        "soil_type": ["Loamy", "Clayey", "Sandy"], # All soil types
        "description": "Tropical palm requiring high nutrients and moisture"
    },
    
    "coffee": {
        "N": (60, 120),      # Moderate to high N
        "P": (30, 60),       # Moderate P
        "K": (80, 150),      # High K
        "pH": (5.5, 6.5),    # Acidic
        "temp": (18, 24),    # Cool tropical
        "humidity": (70, 85), # High humidity
        "rainfall": (1200, 2000), # High rainfall
        "soil_type": ["Loamy", "Clayey"], # Rich soils
        "description": "Shade-loving tropical crop"
    },
    
    "cotton": {
        "N": (80, 150),      # High N requirement
        "P": (40, 80),       # High P requirement
        "K": (60, 120),      # Moderate to high K
        "pH": (6.0, 8.0),    # Neutral to alkaline
        "temp": (25, 35),    # Warm
        "humidity": (40, 60), # Low humidity (FIXED)
        "rainfall": (500, 1000), # Moderate rainfall
        "soil_type": ["Loamy", "Clayey"], # Heavy soils
        "description": "Fiber crop requiring good drainage"
    },
    
    "grapes": {
        "N": (40, 80),       # Moderate N
        "P": (20, 40),       # Low to moderate P
        "K": (60, 120),      # High K
        "pH": (6.0, 7.5),    # Neutral
        "temp": (15, 30),    # Temperate to warm
        "humidity": (50, 70), # Moderate humidity
        "rainfall": (400, 800), # Low to moderate rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Vine crop requiring good drainage"
    },
    
    "jute": {
        "N": (60, 120),      # High N
        "P": (30, 60),       # Moderate P
        "K": (40, 80),       # Moderate K
        "pH": (6.0, 7.5),    # Neutral
        "temp": (24, 35),    # Warm
        "humidity": (70, 85), # High humidity
        "rainfall": (1000, 2000), # High rainfall
        "soil_type": ["Loamy", "Clayey"], # Heavy soils
        "description": "Fiber crop requiring high moisture"
    },
    
    "kidneybeans": {
        "N": (20, 40),       # Low N (legume)
        "P": (25, 45),       # Moderate P
        "K": (40, 80),       # Moderate K
        "pH": (6.0, 7.5),    # Neutral
        "temp": (20, 30),    # Moderate temperature
        "humidity": (50, 70), # Moderate humidity
        "rainfall": (400, 800), # Moderate rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Legume crop with moderate requirements"
    },
    
    "lentil": {
        "N": (15, 30),       # Very low N (legume)
        "P": (20, 40),       # Low to moderate P
        "K": (30, 60),       # Moderate K
        "pH": (6.0, 8.0),    # Neutral to alkaline
        "temp": (15, 25),    # Cool temperature
        "humidity": (40, 60), # Low humidity
        "rainfall": (300, 600), # Low rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Cool-season legume"
    },
    
    "maize": {
        "N": (80, 150),      # High N requirement
        "P": (40, 80),       # High P requirement
        "K": (60, 120),      # High K requirement
        "pH": (6.0, 7.5),    # Neutral
        "temp": (25, 30),    # Warm
        "humidity": (60, 80), # Moderate to high humidity
        "rainfall": (600, 1200), # Moderate to high rainfall
        "soil_type": ["Loamy", "Clayey"], # Heavy soils
        "description": "High-yielding cereal crop"
    },
    
    "mango": {
        "N": (60, 120),      # Moderate to high N
        "P": (30, 60),       # Moderate P
        "K": (80, 150),      # High K
        "pH": (6.0, 7.5),    # Neutral
        "temp": (24, 32),    # Tropical warm
        "humidity": (60, 80), # Moderate to high humidity
        "rainfall": (800, 1500), # Moderate to high rainfall
        "soil_type": ["Loamy", "Clayey"], # Rich soils
        "description": "Tropical fruit tree"
    },
    
    "mothbeans": {
        "N": (15, 30),       # Low N (legume)
        "P": (20, 40),       # Moderate P
        "K": (30, 60),       # Moderate K
        "pH": (6.0, 7.5),    # Neutral
        "temp": (25, 35),    # Warm
        "humidity": (50, 70), # Moderate humidity
        "rainfall": (400, 800), # Moderate rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Drought-tolerant legume"
    },
    
    "mungbean": {
        "N": (15, 30),       # Low N (legume)
        "P": (20, 40),       # Moderate P
        "K": (30, 60),       # Moderate K
        "pH": (6.0, 7.5),    # Neutral
        "temp": (25, 35),    # Warm
        "humidity": (50, 70), # Moderate humidity
        "rainfall": (400, 800), # Moderate rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Short-duration legume"
    },
    
    "muskmelon": {
        "N": (40, 80),       # Moderate N
        "P": (20, 40),       # Moderate P
        "K": (60, 120),      # High K
        "pH": (6.0, 7.0),    # Neutral
        "temp": (25, 35),    # Warm
        "humidity": (60, 80), # Moderate to high humidity
        "rainfall": (500, 1000), # Moderate rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Warm-season cucurbit"
    },
    
    "orange": {
        "N": (60, 120),      # Moderate to high N
        "P": (30, 60),       # Moderate P
        "K": (80, 150),      # High K
        "pH": (6.0, 7.5),    # Neutral
        "temp": (20, 30),    # Moderate to warm
        "humidity": (60, 80), # Moderate to high humidity
        "rainfall": (800, 1500), # Moderate to high rainfall
        "soil_type": ["Loamy", "Clayey"], # Rich soils
        "description": "Citrus fruit tree"
    },
    
    "papaya": {
        "N": (60, 120),      # Moderate to high N
        "P": (30, 60),       # Moderate P
        "K": (80, 150),      # High K
        "pH": (6.0, 7.0),    # Neutral
        "temp": (25, 32),    # Tropical warm
        "humidity": (70, 85), # High humidity
        "rainfall": (1000, 2000), # High rainfall
        "soil_type": ["Loamy", "Clayey"], # Rich soils
        "description": "Tropical fruit tree"
    },
    
    "pigeonpeas": {
        "N": (20, 40),       # Low N (legume)
        "P": (25, 45),       # Moderate P
        "K": (40, 80),       # Moderate K
        "pH": (6.0, 7.5),    # Neutral
        "temp": (25, 35),    # Warm
        "humidity": (50, 70), # Moderate humidity
        "rainfall": (500, 1000), # Moderate rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Drought-tolerant legume"
    },
    
    "pomegranate": {
        "N": (40, 80),       # Moderate N
        "P": (20, 40),       # Moderate P
        "K": (60, 120),       # High K
        "pH": (6.0, 8.0),    # Neutral to alkaline
        "temp": (20, 35),    # Wide temperature range
        "humidity": (40, 70), # Low to moderate humidity
        "rainfall": (400, 800), # Low to moderate rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Drought-tolerant fruit tree"
    },
    
    "rice": {
        "N": (80, 150),      # High N requirement
        "P": (40, 80),       # High P requirement
        "K": (60, 120),      # High K requirement
        "pH": (5.5, 7.0),    # Acidic to neutral
        "temp": (25, 35),    # Warm
        "humidity": (80, 90), # Very high humidity
        "rainfall": (1000, 2000), # High rainfall
        "soil_type": ["Clayey"], # Heavy clay soils
        "description": "Staple cereal requiring flooded conditions"
    },
    
    "watermelon": {
        "N": (40, 80),       # Moderate N
        "P": (20, 40),       # Moderate P
        "K": (60, 120),      # High K
        "pH": (6.0, 7.0),    # Neutral
        "temp": (25, 35),    # Warm
        "humidity": (60, 80), # Moderate to high humidity
        "rainfall": (500, 1000), # Moderate rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Warm-season cucurbit"
    },
    
    "potato": {
        "N": (60, 100),      # Moderate to high N
        "P": (40, 80),       # High P requirement
        "K": (100, 200),     # Very high K requirement
        "pH": (4.8, 5.5),    # Acidic
        "temp": (15, 22),    # Cool temperature
        "humidity": (60, 80), # Moderate to high humidity
        "rainfall": (500, 1200), # Moderate to high rainfall
        "soil_type": ["Loamy", "Sandy"], # Well-drained
        "description": "Cool-season tuber crop"
    }
}

def get_crop_requirements(crop_name):
    """Get requirements for a specific crop"""
    return CROP_REQUIREMENTS.get(crop_name.lower(), None)

def get_all_crops():
    """Get list of all available crops"""
    return list(CROP_REQUIREMENTS.keys())

def get_crop_descriptions():
    """Get descriptions for all crops"""
    return {crop: reqs["description"] for crop, reqs in CROP_REQUIREMENTS.items()}

