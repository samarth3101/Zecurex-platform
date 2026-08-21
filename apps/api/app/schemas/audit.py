from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
import uuid

class AuditEventBase(BaseModel):
    transaction_id: uuid.UUID
    event_type: str
    actor_type: str
    action: str
    details: Optional[Dict[str, Any]] = None

class AuditEventCreate(AuditEventBase):
    pass

class AuditEventResponse(AuditEventBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
