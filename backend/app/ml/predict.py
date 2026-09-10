"""ML prediction utilities"""

import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from pathlib import Path

class CareerPredictor:
    """Career prediction using trained model"""
    
    def __init__(self, model_path: str = "./app/ml/model.joblib"):
        self.model_path = model_path
        self.model = None
        self.encoders = {}
        self.feature_names = None
        self.load_model()
    
    def load_model(self):
        """Load trained model"""
        try:
            if Path(self.model_path).exists():
                data = joblib.load(self.model_path)
                self.model = data['model']
                self.encoders = data['encoders']
                self.feature_names = data['feature_names']
                print(f"✅ Model loaded from {self.model_path}")
            else:
                print(f"⚠️  Model not found at {self.model_path}")
                print("   Train model first: python -m app.ml.train")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    
    def prepare_input(self, features: Dict) -> np.ndarray:
        """Prepare input features for prediction"""
        
        feature_vector = []
        
        for feature_name in self.feature_names:
            if feature_name in features:
                value = features[feature_name]
                
                # Handle categorical features
                if feature_name in self.encoders:
                    try:
                        value = self.encoders[feature_name].transform([value])[0]
                    except:
                        # If encoding fails, use default
                        value = 0
                
                feature_vector.append(value)
            else:
                feature_vector.append(0)
        
        return np.array([feature_vector])
    
    def predict(self, features: Dict) -> Tuple[str, float, List[Dict]]:
        """
        Make prediction
        
        Returns:
            - predicted_career: Most likely career
            - confidence: Confidence score (0-100)
            - all_predictions: All careers with scores
        """
        
        if not self.model:
            raise ValueError("Model not loaded. Train model first.")
        
        # Prepare input
        X_input = self.prepare_input(features)
        
        # Make prediction
        predictions = self.model.predict_proba(X_input)[0]
        predicted_idx = np.argmax(predictions)
        predicted_career = self.model.classes_[predicted_idx]
        confidence = float(predictions[predicted_idx]) * 100
        
        # Get all predictions sorted by score
        all_predictions = []
        for idx, score in enumerate(predictions):
            all_predictions.append({
                'career': self.model.classes_[idx],
                'score': float(score) * 100
            })
        
        all_predictions.sort(key=lambda x: x['score'], reverse=True)
        
        return predicted_career, confidence, all_predictions
    
    def predict_proba(self, features: Dict) -> Dict[str, float]:
        """Get probability for each class"""
        
        if not self.model:
            raise ValueError("Model not loaded")
        
        X_input = self.prepare_input(features)
        predictions = self.model.predict_proba(X_input)[0]
        
        result = {}
        for career, prob in zip(self.model.classes_, predictions):
            result[career] = float(prob) * 100
        
        return result
    
    def get_feature_importance(self) -> Dict:
        """Get feature importance from trained model"""
        
        if not self.model or not hasattr(self.model, 'feature_importances_'):
            return {}
        
        importance_dict = {}
        for feature, importance in zip(self.feature_names, self.model.feature_importances_):
            importance_dict[feature] = float(importance)
        
        # Sort by importance
        sorted_importance = sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "all_features": importance_dict,
            "top_10": {name: score for name, score in sorted_importance[:10]}
        }
    
    def explain_prediction(self, features: Dict, top_n: int = 3) -> Dict:
        """Explain why a career was recommended"""
        
        career, confidence, all_predictions = self.predict(features)
        feature_importance = self.get_feature_importance()
        
        explanation = {
            "predicted_career": career,
            "confidence": confidence,
            "top_careers": all_predictions[:top_n],
            "top_features": feature_importance.get("top_10", {}),
            "reasoning": []
        }
        
        # Add reasoning
        if confidence >= 80:
            explanation["reasoning"].append(f"High confidence match ({confidence:.0f}%)")
        elif confidence >= 60:
            explanation["reasoning"].append(f"Good match ({confidence:.0f}%)")
        else:
            explanation["reasoning"].append(f"Moderate match ({confidence:.0f}%)")
        
        # Check for strong indicators
        top_features = feature_importance.get("top_10", {})
        for feature in top_features:
            if feature in features and features[feature]:
                explanation["reasoning"].append(f"Your {feature} is a strong indicator")
        
        return explanation
    
    @staticmethod
    def batch_predict(predictor, features_list: List[Dict]) -> List[Dict]:
        """Batch prediction"""
        results = []
        
        for features in features_list:
            try:
                career, confidence, all_preds = predictor.predict(features)
                results.append({
                    "predicted_career": career,
                    "confidence": confidence,
                    "top_predictions": all_preds[:3]
                })
            except Exception as e:
                results.append({
                    "error": str(e)
                })
        
        return results