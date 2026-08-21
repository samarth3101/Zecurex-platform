from datetime import datetime, timezone
import uuid
from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class BaseModel(Base):
    __abstract__ = True
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
