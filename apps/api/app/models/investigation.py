from typing import Optional, Any, Dict, List
import uuid
from datetime import datetime
from sqlalchemy import String, Float, ForeignKey, JSON, Text, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

class Investigation(BaseModel):
    __tablename__ = "investigations"

    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id", ondelete="CASCADE"), index=True)
    risk_assessment_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("risk_assessments.id", ondelete="SET NULL"), nullable=True, index=True)
    
    status: Mapped[str] = mapped_column(String, default="PENDING")
    severity: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evidence: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    reasoning: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    key_findings: Mapped[Optional[List[str]]] = mapped_column(JSONB, nullable=True)
    recommendation: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    confidence: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    agent_model: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    agent_version: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="investigations")
    risk_assessment: Mapped[Optional["RiskAssessment"]] = relationship("RiskAssessment", back_populates="investigations")
