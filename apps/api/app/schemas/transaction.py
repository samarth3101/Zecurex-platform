from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
import uuid

class TransactionBase(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    method: str
    international: bool = False
    
    email_hash: Optional[str] = None
    contact_hash: Optional[str] = None
    card_id_hash: Optional[str] = None
    
    bank: Optional[str] = None
    wallet: Optional[str] = None
    
    amount_refunded: float = 0.0
    refund_status: Optional[str] = None
    
    error_code: Optional[str] = None
    error_source: Optional[str] = None
    error_step: Optional[str] = None
    error_reason: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
