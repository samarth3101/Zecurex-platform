from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
import uuid

class InvestigationBase(BaseModel):
    transaction_id: uuid.UUID
    risk_assessment_id: Optional[uuid.UUID] = None
    summary: Optional[str] = None
    evidence: Optional[Dict[str, Any]] = None
    reasoning: Optional[str] = None
    recommendation: Optional[str] = None
    confidence: Optional[float] = None
    agent_model: Optional[str] = None
    agent_version: Optional[str] = None
    completed_at: Optional[datetime] = None

class InvestigationCreate(InvestigationBase):
    pass

class InvestigationResponse(InvestigationBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
