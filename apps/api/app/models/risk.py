from typing import Optional, Any, Dict, List
import uuid
from sqlalchemy import String, Float, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

class RiskAssessment(BaseModel):
    __tablename__ = "risk_assessments"

    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id", ondelete="CASCADE"), index=True)
    
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_level: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True) # LOW, MEDIUM, HIGH, CRITICAL
    
    model_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    decision: Mapped[Optional[str]] = mapped_column(String, nullable=True) # ALLOW, REVIEW, HOLD, BLOCK
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    risk_factors: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="risk_assessments")
    investigations: Mapped[List["Investigation"]] = relationship("Investigation", back_populates="risk_assessment", cascade="all, delete-orphan")
