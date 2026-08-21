from typing import Any, Dict, Optional
from datetime import datetime
from sqlalchemy import String, JSON, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel

class WebhookEvent(BaseModel):
    __tablename__ = "webhook_events"

    event_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    event_type: Mapped[str] = mapped_column(String, index=True)
    payload: Mapped[Dict[str, Any]] = mapped_column(JSONB)
    signature: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    processing_status: Mapped[str] = mapped_column(String, default="RECEIVED") # RECEIVED, PROCESSING, PROCESSED, FAILED
    error_message: Mapped[Optional[str]] = mapped_column(String, nullable=True)
