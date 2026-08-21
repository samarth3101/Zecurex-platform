import joblib
from pathlib import Path
from typing import Dict, Any, Tuple
import pandas as pd

class ModelLoader:
    _instance = None

    def __init__(self, model_path: Path):
        self.model_path = model_path
        self.model = None
        self.preprocessor = None
        self.threshold = None
        self.feature_columns = None
        
        self.model_name = "zecure-random-forest"
        self.model_version = "1.0.0"
        self.feature_version = "1.0.0"

        self._load()

    @classmethod
    def get_instance(cls, model_path: Path = None) -> 'ModelLoader':
        if cls._instance is None:
            if model_path is None:
                # Default path assumes running from api root or similar
                model_path = Path(__file__).resolve().parent.parent.parent.parent.parent.parent / "ml" / "models" / "zecure_risk_model.joblib"
            cls._instance = cls(model_path)
        return cls._instance

    def _load(self):
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model artifact not found at {self.model_path}")
        
        try:
            artifact = joblib.load(self.model_path)
            self.model = artifact.get("model")
            self.preprocessor = artifact.get("preprocessor")
            self.threshold = artifact.get("threshold", 0.45)
            self.feature_columns = artifact.get("feature_columns")
            
            if not self.model or not self.preprocessor or not self.feature_columns:
                raise ValueError("Corrupt model artifact: missing required components.")
                
        except Exception as e:
            raise RuntimeError(f"Failed to load model artifact: {str(e)}")

    def predict_proba(self, features_df: pd.DataFrame) -> float:
        """
        Predict fraud probability for a single transaction.
        Expects a DataFrame with 1 row containing the required features.
        """
        if features_df.empty:
            raise ValueError("Empty feature dataframe provided for inference.")
            
        # Ensure only the expected columns are passed to the preprocessor
        X_raw = features_df[self.feature_columns]
        X_processed = self.preprocessor.transform(X_raw)
        
        # Binary classification -> get proba of positive class (fraud)
        proba = self.model.predict_proba(X_processed)[0, 1]
        return float(proba)

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "model_name": self.model_name,
            "model_version": self.model_version,
            "feature_version": self.feature_version,
            "threshold": self.threshold
        }
