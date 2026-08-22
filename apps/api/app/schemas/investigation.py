from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
from pydantic import BaseModel, Field

class InvestigationEvidenceProvenance(BaseModel):
    source_type: str = Field(description="The source of the evidence, e.g., 'feature', 'database', 'transaction', 'risk_assessment'")
    source_ref: str = Field(description="The specific reference, e.g., 'customer_txn_count_15m'")

class EvidenceItem(BaseModel):
    signal: str
    observed_value: Any
    baseline_value: Optional[Any] = None
    window: Optional[str] = None
    description: str
    provenance: InvestigationEvidenceProvenance

class StructuredEvidence(BaseModel):
    transaction_evidence: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    customer_behavior: Dict[str, Any]
    velocity_evidence: Dict[str, Any]
    merchant_behavior: Dict[str, Any]
    network_evidence: Dict[str, Any]
    historical_context: List[str]
    anomalies: List[EvidenceItem]

class InvestigationReasoning(BaseModel):
    what_happened: str
    why_flagged: str
    what_changed_from_normal: str
    multiple_independent_signals: str
    evidence_weakening_concern: str
    what_should_happen_next: str

class InvestigationResult(BaseModel):
    summary: str
    severity: str = Field(pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    reasoning: InvestigationReasoning
    key_findings: List[str]
    recommendation: str = Field(pattern="^(ALLOW|MONITOR|REVIEW|ESCALATE)$")
    confidence: Optional[str] = Field(pattern="^(LOW|MEDIUM|HIGH)$", default=None)

class InvestigationResponse(BaseModel):
    investigation_id: uuid.UUID
    transaction_id: uuid.UUID
    risk_assessment_id: Optional[uuid.UUID] = None
    status: str
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    summary: Optional[str] = None
    severity: Optional[str] = None
    key_findings: Optional[List[str]] = None
    recommendation: Optional[str] = None
    confidence: Optional[str] = None
    agent_model: Optional[str] = None
    agent_version: Optional[str] = None
    completed_at: Optional[datetime] = None
