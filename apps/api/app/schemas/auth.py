from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    name: Optional[str] = None

class VerifyRegistrationRequest(BaseModel):
    email: str
    code: str = Field(..., min_length=6, max_length=6)

class ResendCodeRequest(BaseModel):
    email: str
    purpose: str = "REGISTRATION"  # "REGISTRATION", "LOGIN_STEPUP", "PASSWORD_RESET"

class LoginRequest(BaseModel):
    email: str
    password: str
    passcode: Optional[str] = None  # Backward compatibility field

class VerifyLoginRequest(BaseModel):
    email: str
    code: str = Field(..., min_length=6, max_length=6)
    trust_device: bool = False

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    name: Optional[str] = None
    email_verified: bool
    role: str
    created_at: datetime

class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    device_name: str
    ip_address: Optional[str] = None
    is_current: bool = False
    is_trusted: bool = False
    last_seen_at: datetime
    created_at: datetime
    expires_at: datetime

class SecurityEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_type: str
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

class AuthStatusResponse(BaseModel):
    status: str  # "authenticated", "requires_verification", "registration_pending", "password_reset_pending"
    message: str
    user: Optional[UserResponse] = None
    recovery_codes: Optional[List[str]] = None
    dev_otp: Optional[str] = None  # Included only in development mode for convenience
