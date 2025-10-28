#!/usr/bin/env python3
"""
Hybrid ML + Rule-based Engine
Combines advanced ML models with rule-based logic
"""

import joblib
import os
import numpy as np
from typing import Dict, List, Tuple
from suitability_engine import calculate_all_suitabilities, get_top_recommendations
from crop_database import get_all_crops

class HybridEngine:
    """Hybrid engine combining ML models with rule-based logic"""
    
    def __init__(self, model_dir: str = "ml_model/models/advanced"):
        """Initialize hybrid engine with ML models"""
        self.model_dir = model_dir
        self.ml_models = {}
        self.model_info = {}
        self.available_ml_crops = []
        
        # Load available ML models
        self._load_ml_models()
        
    def _load_ml_models(self):
        """Load all available ML models"""
        if not os.path.exists(self.model_dir):
            print(f"ML model directory not found: {self.model_dir}")
            return
            
        try:
            # Find all available models
            for filename in os.listdir(self.model_dir):
                if filename.endswith('_regressor.joblib'):
                    crop_name = filename.replace('_regressor.joblib', '')
                    
                    # Load model
                    model_path = os.path.join(self.model_dir, filename)
                    info_path = os.path.join(self.model_dir, f'{crop_name}_info.joblib')
                    
                    if os.path.exists(model_path) and os.path.exists(info_path):
                        model = joblib.load(model_path)
                        info = joblib.load(info_path)
                        
                        self.ml_models[crop_name] = model
                        self.model_info[crop_name] = info
                        self.available_ml_crops.append(crop_name)
            
            print(f"Loaded {len(self.available_ml_crops)} ML models: {self.available_ml_crops}")
            
        except Exception as e:
            print(f"Error loading ML models: {e}")
    
    def predict_ml_suitability(self, user_input: Dict) -> Dict[str, float]:
        """Predict suitability using ML models"""
        ml_predictions = {}
        
        # Prepare input array
        feature_columns = ['N', 'P', 'K', 'ph', 'temperature', 'humidity', 'rainfall']
        input_array = np.array([[
            user_input['N'],
            user_input['P'], 
            user_input['K'],
            user_input['ph'],
            user_input['temperature'],
            user_input['humidity'],
            user_input['rainfall']
        ]])
        
        # Get predictions from available ML models
        for crop_name, model in self.ml_models.items():
            try:
                prediction = model.predict(input_array)[0]
                # Ensure prediction is between 0 and 1
                prediction = max(0, min(1, prediction))
                ml_predictions[crop_name] = prediction
            except Exception as e:
                print(f"Error predicting {crop_name}: {e}")
                ml_predictions[crop_name] = 0.0
        
        return ml_predictions
    
    def get_hybrid_recommendations(self, user_input: Dict, top_n: int = 5) -> Dict:
        """Get hybrid recommendations combining ML and rule-based"""
        
        # Get rule-based recommendations
        rule_results = get_top_recommendations(user_input, top_n=10)
        
        # Get ML predictions for available crops
        ml_predictions = self.predict_ml_suitability(user_input)
        
        # Combine results
        hybrid_results = []
        
        # Process rule-based results
        all_results = []
        if rule_results.get('primary_recommendation'):
            all_results.append(rule_results['primary_recommendation'])
        if rule_results.get('alternative_recommendations'):
            all_results.extend(rule_results['alternative_recommendations'])
        
        for result in all_results:
            crop_name = result['crop']
            rule_score = result['score'] / 100.0  # Convert to 0-1 scale
            
            # Get ML prediction if available
            ml_score = ml_predictions.get(crop_name, rule_score)
            
            # Weighted combination (70% rule-based, 30% ML)
            if crop_name in self.available_ml_crops:
                hybrid_score = 0.7 * rule_score + 0.3 * ml_score
                confidence_source = "Hybrid (Rule + ML)"
            else:
                hybrid_score = rule_score
                confidence_source = "Rule-based"
            
            hybrid_results.append({
                'crop': crop_name,
                'score': hybrid_score * 100,  # Convert back to percentage
                'rule_score': rule_score * 100,
                'ml_score': ml_score * 100 if crop_name in self.available_ml_crops else None,
                'confidence_source': confidence_source,
                'reason': result.get('reason', 'Good Match')
            })
        
        # Sort by hybrid score
        hybrid_results.sort(key=lambda x: x['score'], reverse=True)
        
        # Format response
        primary = hybrid_results[0] if hybrid_results else None
        alternatives = hybrid_results[1:top_n] if len(hybrid_results) > 1 else []
        
        return {
            'primary_recommendation': primary,
            'alternative_recommendations': alternatives,
            'all_recommendations': hybrid_results,
            'ml_available_crops': self.available_ml_crops,
            'total_crops_evaluated': len(hybrid_results)
        }
    
    def get_engine_info(self) -> Dict:
        """Get information about the hybrid engine"""
        return {
            'engine_type': 'Hybrid (Rule-based + ML)',
            'rule_based_crops': len(get_all_crops()),
            'ml_available_crops': len(self.available_ml_crops),
            'ml_crops': self.available_ml_crops,
            'total_crops': len(get_all_crops()),
            'ml_model_performance': {
                crop: {
                    'algorithm': info.get('algorithm', 'Unknown'),
                    'r2_score': info.get('r2_score', 0),
                    'cv_mean': info.get('cv_mean', 0)
                } for crop, info in self.model_info.items()
            }
        }

# Global hybrid engine instance
hybrid_engine = HybridEngine()
