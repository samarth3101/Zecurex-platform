from typing import Optional, List
from datetime import datetime
from sqlalchemy import String, Float, Boolean, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

class Transaction(BaseModel):
    __tablename__ = "transactions"

    razorpay_payment_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    razorpay_order_id: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)

    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, index=True)
    method: Mapped[str] = mapped_column(String)

    international: Mapped[bool] = mapped_column(Boolean, default=False)
    
    customer_id: Mapped[str] = mapped_column(String, index=True)
    merchant_id: Mapped[str] = mapped_column(String, index=True)
    device_id: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    ip_hash: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    geo_region: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    email_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    contact_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    card_id_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    bank: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    wallet: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    amount_refunded: Mapped[float] = mapped_column(Float, default=0.0)
    refund_status: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    error_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    error_source: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    error_step: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    error_reason: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    risk_assessments: Mapped[List["RiskAssessment"]] = relationship("RiskAssessment", back_populates="transaction", cascade="all, delete-orphan")
    investigations: Mapped[List["Investigation"]] = relationship("Investigation", back_populates="transaction", cascade="all, delete-orphan")
    audit_events: Mapped[List["AuditEvent"]] = relationship("AuditEvent", back_populates="transaction", cascade="all, delete-orphan")
