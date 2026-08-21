from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
import uuid

class RiskAssessmentBase(BaseModel):
    transaction_id: uuid.UUID
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    decision: Optional[str] = None
    confidence: Optional[float] = None
    risk_factors: Optional[Dict[str, Any]] = None

class RiskAssessmentCreate(RiskAssessmentBase):
    pass

class RiskAssessmentResponse(RiskAssessmentBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
