from typing import Optional, Any, Dict
import uuid
from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

class AuditEvent(BaseModel):
    __tablename__ = "audit_events"

    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id", ondelete="CASCADE"), index=True)
    
    event_type: Mapped[str] = mapped_column(String, index=True)
    actor_type: Mapped[str] = mapped_column(String)
    
    action: Mapped[str] = mapped_column(String)
    details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="audit_events")
