from typing import Optional, Dict, Any, List
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, utc_now

class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="operator", nullable=False)
    
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    trusted_devices: Mapped[List["TrustedDevice"]] = relationship("TrustedDevice", back_populates="user", cascade="all, delete-orphan")
    recovery_codes: Mapped[List["RecoveryCode"]] = relationship("RecoveryCode", back_populates="user", cascade="all, delete-orphan")
    security_events: Mapped[List["SecurityEvent"]] = relationship("SecurityEvent", back_populates="user", cascade="all, delete-orphan")

class Session(BaseModel):
    __tablename__ = "sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    session_token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    
    device_name: Mapped[str] = mapped_column(String(100), default="Unknown Device", nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_trusted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="sessions")

    @property
    def is_active_session(self) -> bool:
        now = utc_now()
        return self.revoked_at is None and self.expires_at > now

class TrustedDevice(BaseModel):
    __tablename__ = "trusted_devices"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    device_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    device_name: Mapped[str] = mapped_column(String(100), default="Recognized Device", nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="trusted_devices")

    @property
    def is_valid(self) -> bool:
        return self.expires_at > utc_now()

class VerificationCode(BaseModel):
    __tablename__ = "verification_codes"

    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    purpose: Mapped[str] = mapped_column(String(50), nullable=False)  # "REGISTRATION", "LOGIN_STEPUP", "PASSWORD_RESET"
    code_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_attempts: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    consumed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    @property
    def is_valid(self) -> bool:
        return self.consumed_at is None and self.attempts < self.max_attempts and self.expires_at > utc_now()

class RecoveryCode(BaseModel):
    __tablename__ = "recovery_codes"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    code_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="recovery_codes")

class SecurityEvent(BaseModel):
    __tablename__ = "security_events"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    
    event_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    device_info: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="security_events")
