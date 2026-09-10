"""Data preprocessing for ML model"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from typing import Tuple, Dict
import json

class DataPreprocessor:
    """Data preprocessing utilities"""
    
    def __init__(self):
        self.scalers = {}
        self.encoders = {}
        self.feature_names = None
    
    @staticmethod
    def load_dataset(filepath: str) -> pd.DataFrame:
        """Load dataset from CSV"""
        try:
            df = pd.read_csv(filepath)
            print(f"✅ Loaded dataset: {df.shape}")
            print(f"   Columns: {df.columns.tolist()}")
            print(f"   Target distribution:\n{df.iloc[:, -1].value_counts()}")
            return df
        except Exception as e:
            print(f"❌ Error loading dataset: {e}")
            return None
    
    @staticmethod
    def handle_missing_values(df: pd.DataFrame, strategy: str = 'mean') -> pd.DataFrame:
        """Handle missing values"""
        df = df.copy()
        
        if strategy == 'mean':
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
        elif strategy == 'median':
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
        elif strategy == 'drop':
            df = df.dropna()
        
        print(f"✅ Handled missing values: {df.shape}")
        return df
    
    @staticmethod
    def detect_outliers(df: pd.DataFrame, columns: list = None, threshold: float = 3.0) -> pd.DataFrame:
        """Detect and remove outliers using Z-score"""
        df = df.copy()
        
        if columns is None:
            columns = df.select_dtypes(include=[np.number]).columns.tolist()
        
        from scipy import stats
        z_scores = np.abs(stats.zscore(df[columns].select_dtypes(include=[np.number])))
        df = df[(z_scores < threshold).all(axis=1)]
        
        print(f"✅ Removed outliers: {df.shape}")
        return df
    
    def encode_categorical(self, df: pd.DataFrame, categorical_cols: list = None) -> pd.DataFrame:
        """Encode categorical variables"""
        df = df.copy()
        
        if categorical_cols is None:
            categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
            # Remove target column if present
            if 'career' in categorical_cols:
                categorical_cols.remove('career')
        
        for col in categorical_cols:
            if col not in self.encoders:
                self.encoders[col] = LabelEncoder()
                df[col] = self.encoders[col].fit_transform(df[col].astype(str))
            else:
                df[col] = self.encoders[col].transform(df[col].astype(str))
        
        print(f"✅ Encoded {len(categorical_cols)} categorical columns")
        return df
    
    def normalize_features(self, df: pd.DataFrame, numeric_cols: list = None) -> pd.DataFrame:
        """Normalize numeric features"""
        df = df.copy()
        
        if numeric_cols is None:
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        for col in numeric_cols:
            if col not in self.scalers:
                self.scalers[col] = StandardScaler()
                df[col] = self.scalers[col].fit_transform(df[[col]])
            else:
                df[col] = self.scalers[col].transform(df[[col]])
        
        print(f"✅ Normalized {len(numeric_cols)} numeric columns")
        return df
    
    def create_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Separate features and target"""
        X = df.drop('career', axis=1)
        y = df['career']
        
        self.feature_names = X.columns.tolist()
        
        print(f"✅ Created features: {X.shape}")
        print(f"   Features: {self.feature_names}")
        
        return X, y
    
    def get_feature_importance_analysis(self, feature_importance: list) -> Dict:
        """Analyze feature importance"""
        if not self.feature_names:
            return {}
        
        importance_dict = {}
        for feature, importance in zip(self.feature_names, feature_importance):
            importance_dict[feature] = float(importance)
        
        # Sort by importance
        sorted_importance = sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "all_features": importance_dict,
            "top_10": {name: score for name, score in sorted_importance[:10]},
            "total_features": len(importance_dict)
        }
    
    @staticmethod
    def split_data(X, y, test_size: float = 0.2, random_state: int = 42):
        """Split data into train and test"""
        from sklearn.model_selection import train_test_split

        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=test_size,
            random_state=random_state
        )
        
        print(f"✅ Split data:")
        print(f"   Train: {X_train.shape}")
        print(f"   Test: {X_test.shape}")
        
        return X_train, X_test, y_train, y_test
    
    @staticmethod
    def get_class_distribution(y):
        """Get class distribution"""
        distribution = y.value_counts()
        print(f"✅ Class distribution:")
        for class_name, count in distribution.items():
            percentage = (count / len(y)) * 100
            print(f"   {class_name}: {count} ({percentage:.1f}%)")
        
        return distribution

class FeatureEngineering:
    """Feature engineering utilities"""
    
    @staticmethod
    def create_interaction_features(df: pd.DataFrame, cols1: list, cols2: list) -> pd.DataFrame:
        """Create interaction features"""
        df = df.copy()
        
        for col1 in cols1:
            for col2 in cols2:
                if col1 in df.columns and col2 in df.columns:
                    df[f'{col1}_{col2}_interaction'] = df[col1] * df[col2]
        
        return df
    
    @staticmethod
    def create_polynomial_features(df: pd.DataFrame, cols: list, degree: int = 2) -> pd.DataFrame:
        """Create polynomial features"""
        df = df.copy()
        
        from sklearn.preprocessing import PolynomialFeatures
        
        poly = PolynomialFeatures(degree=degree, include_bias=False)
        
        for col in cols:
            if col in df.columns:
                poly_features = poly.fit_transform(df[[col]])
                for i in range(1, poly_features.shape[1]):
                    df[f'{col}_poly_{i}'] = poly_features[:, i]
        
        return df
    
    @staticmethod
    def create_ratio_features(df: pd.DataFrame, numerator_cols: list, denominator_cols: list) -> pd.DataFrame:
        """Create ratio features"""
        df = df.copy()
        
        for num_col in numerator_cols:
            for denom_col in denominator_cols:
                if num_col in df.columns and denom_col in df.columns:
                    # Avoid division by zero
                    df[f'{num_col}_ratio_{denom_col}'] = df[num_col] / (df[denom_col] + 1e-8)
        
        return df