import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import os
from pathlib import Path
from app.ml.preprocess import DataPreprocessor, FeatureEngineering

class CareerMLModel:
    """ML model for career prediction"""
    
    def __init__(self, model_path: str = "./app/ml/model.joblib"):
        self.model = None
        self.preprocessor = DataPreprocessor()
        self.model_path = model_path
        self.feature_names = None
    
    def load_data(self, dataset_path: str) -> pd.DataFrame:
        """Load training dataset"""
        df = self.preprocessor.load_dataset(dataset_path)
        return df
    
    def preprocess(self, df: pd.DataFrame) -> tuple:
        """Preprocess data"""
        print("\n🔄 Starting preprocessing...")
        
        # Handle missing values
        df = self.preprocessor.handle_missing_values(df, strategy='mean')
        
        # Detect and remove outliers
        df = self.preprocessor.detect_outliers(df, threshold=3.0)
        
        # Encode categorical features (except target)
        categorical_cols = ['experience_level', 'education']
        df = self.preprocessor.encode_categorical(df, categorical_cols)
        
        # Separate features and target
        X, y = self.preprocessor.create_features(df)
        
        print("✅ Preprocessing complete")
        return X, y
    
    def train(self, dataset_path: str) -> dict:
        """Train the model"""
        print("\n🤖 Starting model training...")
        
        # Load data
        df = self.load_data(dataset_path)
        
        if df is None or df.empty:
            raise ValueError("Dataset is empty or invalid")
        
        # Preprocess
        X, y = self.preprocess(df)
        
        # Split data
        print("\n📊 Splitting data...")
        X_train, X_test, y_train, y_test = self.preprocessor.split_data(X, y)
        
        # Train model
        print("\n🏋️ Training Random Forest model...")
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
            class_weight='balanced'
        )
        
        self.model.fit(X_train, y_train)
        self.feature_names = X.columns.tolist()
        
        # Evaluate
        print("\n📈 Evaluating model...")
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"\n✅ Model Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
        
                # Cross-validation
        min_class_count = y_train.value_counts().min()
        cv_folds = min(5, min_class_count)
        
        if cv_folds >= 2:
            cv_scores = cross_val_score(self.model, X_train, y_train, cv=cv_folds)
        else:
            cv_scores = np.array([accuracy])
            print("⚠️ Skipping cross-validation: not enough samples per class")
        print(f"✅ Cross-validation scores: {cv_scores}")
        print(f"   Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

        # Classification report
        print("\n📋 Classification Report:")
        print(classification_report(y_test, y_pred, zero_division=0))
        
        # Confusion matrix
        print("\n🔗 Confusion Matrix:")
        cm = confusion_matrix(y_test, y_pred)
        print(cm)
        
        # Feature importance
        print("\n⭐ Top 15 Important Features:")
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        for idx, row in feature_importance.head(15).iterrows():
            print(f"   {row['feature']}: {row['importance']:.4f}")
        
        return {
            "accuracy": float(accuracy),
            "cv_mean": float(cv_scores.mean()),
            "cv_std": float(cv_scores.std()),
            "n_samples": len(X),
            "n_features": X.shape[1],
            "n_classes": len(self.model.classes_),
            "classes": list(self.model.classes_),
            "feature_importance": feature_importance.to_dict('records')
        }
    
    def save(self):
        """Save trained model"""
        if not self.model:
            raise ValueError("No model to save. Train first.")
        
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
        joblib.dump({
            'model': self.model,
            'encoders': self.preprocessor.encoders,
            'feature_names': self.feature_names
        }, self.model_path)
        
        print(f"\n✅ Model saved to {self.model_path}")
    
    def load(self):
        """Load saved model"""
        if not Path(self.model_path).exists():
            raise FileNotFoundError(f"Model not found at {self.model_path}")
        
        data = joblib.load(self.model_path)
        self.model = data['model']
        self.preprocessor.encoders = data['encoders']
        self.feature_names = data['feature_names']
        
        print(f"✅ Model loaded from {self.model_path}")

    def predict(self, features: dict) -> tuple:
        """Predict career from feature dict"""
        if not self.model:
            raise ValueError("Model not loaded. Call load() first.")

        row = {}
        for col in self.feature_names:
            row[col] = features.get(col, 0)

        # Encode categorical fields using saved encoders
        for col, encoder in self.preprocessor.encoders.items():
            if col in row:
                try:
                    row[col] = encoder.transform([row[col]])[0]
                except ValueError:
                    row[col] = 0  # unseen category fallback

        X = pd.DataFrame([row], columns=self.feature_names)

        probabilities = self.model.predict_proba(X)[0]
        classes = self.model.classes_

        career_scores = sorted(
            [{"career": c, "score": float(p) * 100} for c, p in zip(classes, probabilities)],
            key=lambda x: x["score"],
            reverse=True
        )

        predicted_career = career_scores[0]["career"]
        confidence = career_scores[0]["score"]

        return predicted_career, confidence, career_scores

if __name__ == "__main__":
    import sys
    
    print("\n" + "="*50)
    print("🚀 AI Career Mentor - ML Model Training")
    print("="*50)
    
    try:
        model = CareerMLModel()
        dataset_path = "./app/ml/dataset.csv"
        
        # Check if dataset exists
        if not Path(dataset_path).exists():
            print(f"\n❌ Dataset not found at {dataset_path}")
            print("Please create the dataset first")
            sys.exit(1)
        
        # Train model
        results = model.train(dataset_path)
        
        # Save model
        model.save()
        
        print("\n" + "="*50)
        print("✨ Training complete!")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        sys.exit(1)