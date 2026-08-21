from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
import uuid

class WebhookEventBase(BaseModel):
    event_id: str
    event_type: str
    payload: Dict[str, Any]
    signature: Optional[str] = None
    received_at: datetime
    processed_at: Optional[datetime] = None
    processing_status: str = "RECEIVED"
    error_message: Optional[str] = None

class WebhookEventCreate(WebhookEventBase):
    pass

class WebhookEventResponse(WebhookEventBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
