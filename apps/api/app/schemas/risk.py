from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
import uuid

class TransactionEntity(BaseModel):
    razorpay_payment_id: str
    amount: float
    currency: str
    status: str
    method: str
    international: bool = False
    customer_id: str
    merchant_id: str
    device_id: Optional[str] = None
    ip_hash: Optional[str] = None
    geo_region: Optional[str] = None
    timestamp: Optional[datetime] = None

class RiskAssessmentRequest(BaseModel):
    transaction: TransactionEntity

class RiskSignal(BaseModel):
    feature: str
    value: Any
    description: str

class RiskFactors(BaseModel):
    top_signals: List[RiskSignal]

class RiskAssessmentBase(BaseModel):
    transaction_id: uuid.UUID
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    decision: Optional[str] = None
    confidence: Optional[float] = None
    risk_factors: Optional[RiskFactors] = None

class RiskAssessmentCreate(RiskAssessmentBase):
    pass

class RiskAssessmentResponse(RiskAssessmentBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
