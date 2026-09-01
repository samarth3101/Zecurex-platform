from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.core.config import settings
from app.models.auth import User
from app.schemas.auth import (
    RegisterRequest,
    VerifyRegistrationRequest,
    ResendCodeRequest,
    LoginRequest,
    VerifyLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserResponse,
    SessionResponse,
    SecurityEventResponse,
    AuthStatusResponse,
)
from app.services.auth.auth_service import AuthService
from app.services.email.dev_provider import DevelopmentEmailProvider
from app.services.email.email_service import email_service

router = APIRouter(prefix="/auth", tags=["auth"])

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"

def get_user_agent(request: Request) -> str:
    return request.headers.get("User-Agent", "Unknown Browser")

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    FastAPI dependency to extract and validate the active session from HttpOnly cookie or Bearer header.
    """
    token = request.cookies.get("zecure_admin_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication session required."
        )

    user = await AuthService.authenticate_session(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please sign in again."
        )
    return user

@router.post("/register", response_model=AuthStatusResponse)
async def register_user(
    payload: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = get_client_ip(request)
    ua = get_user_agent(request)
    success, message, dev_otp = await AuthService.register(
        db=db,
        email=payload.email,
        password=payload.password,
        name=payload.name,
        ip_address=ip,
        user_agent=ua
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    return AuthStatusResponse(
        status="registration_pending",
        message=message,
        dev_otp=dev_otp
    )

@router.post("/verify-registration", response_model=AuthStatusResponse)
async def verify_registration(
    payload: VerifyRegistrationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = get_client_ip(request)
    ua = get_user_agent(request)
    success, message, user, recovery_codes = await AuthService.verify_registration(
        db=db,
        email=payload.email,
        code=payload.code,
        ip_address=ip,
        user_agent=ua
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    return AuthStatusResponse(
        status="authenticated",
        message=message,
        user=UserResponse.model_validate(user),
        recovery_codes=recovery_codes
    )

@router.post("/login", response_model=AuthStatusResponse)
async def login_user(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    # Ensure local dev operator is seeded in development
    await AuthService.bootstrap_dev_operator(db)

    ip = get_client_ip(request)
    ua = get_user_agent(request)

    status_code, message, session_token, user, dev_otp = await AuthService.login(
        db=db,
        email=payload.email,
        password=payload.password,
        ip_address=ip,
        user_agent=ua
    )

    if status_code == "failed":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=message)

    if status_code == "authenticated" and session_token:
        # Set HttpOnly Session Cookie
        response.set_cookie(
            key="zecure_admin_token",
            value=session_token,
            httponly=True,
            samesite="lax",
            secure=settings.is_production,
            max_age=settings.SESSION_MAX_AGE_SECONDS,
            path="/"
        )
        return AuthStatusResponse(
            status="authenticated",
            message=message,
            user=UserResponse.model_validate(user)
        )

    # Step-Up Verification Required (New / Untrusted Device)
    return AuthStatusResponse(
        status="requires_verification",
        message=message,
        dev_otp=dev_otp
    )

@router.post("/verify-login", response_model=AuthStatusResponse)
async def verify_login_stepup(
    payload: VerifyLoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    ip = get_client_ip(request)
    ua = get_user_agent(request)

    success, message, session_token, user = await AuthService.verify_login_stepup(
        db=db,
        email=payload.email,
        code=payload.code,
        trust_device=payload.trust_device,
        ip_address=ip,
        user_agent=ua
    )
    if not success or not session_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    response.set_cookie(
        key="zecure_admin_token",
        value=session_token,
        httponly=True,
        samesite="lax",
        secure=settings.is_production,
        max_age=settings.SESSION_MAX_AGE_SECONDS,
        path="/"
    )

    return AuthStatusResponse(
        status="authenticated",
        message=message,
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
async def logout_user(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    token = request.cookies.get("zecure_admin_token")
    if token:
        await AuthService.logout(db, token)
    response.delete_cookie("zecure_admin_token", path="/")
    return {"status": "logged_out"}

@router.post("/forgot-password", response_model=AuthStatusResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = get_client_ip(request)
    ua = get_user_agent(request)
    _, message, dev_otp = await AuthService.forgot_password(
        db=db,
        email=payload.email,
        ip_address=ip,
        user_agent=ua
    )
    return AuthStatusResponse(
        status="password_reset_pending",
        message=message,
        dev_otp=dev_otp
    )

@router.post("/reset-password", response_model=AuthStatusResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = get_client_ip(request)
    ua = get_user_agent(request)
    success, message = await AuthService.reset_password(
        db=db,
        email=payload.email,
        code=payload.code,
        new_password=payload.new_password,
        ip_address=ip,
        user_agent=ua
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    return AuthStatusResponse(
        status="password_reset_completed",
        message=message
    )

@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)

@router.get("/security/sessions", response_model=List[SessionResponse])
async def get_sessions(
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    current_token = request.cookies.get("zecure_admin_token")
    sessions = await AuthService.get_user_sessions(db, user.id, current_token)
    return [SessionResponse(**s) for s in sessions]

@router.delete("/security/sessions/{session_id}")
async def revoke_session(
    session_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await AuthService.revoke_session_by_id(db, user.id, session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found or already revoked.")
    return {"status": "revoked", "session_id": str(session_id)}

@router.get("/security/activity", response_model=List[SecurityEventResponse])
async def get_security_activity(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    events = await AuthService.get_user_security_events(db, user.id, limit=50)
    return [SecurityEventResponse.model_validate(e) for e in events]

@router.get("/dev/latest-otp")
async def get_dev_latest_otp(email: str, purpose: Optional[str] = None):
    """
    Development-only endpoint for automated test verification and inspection.
    Strictly blocked in production.
    """
    if settings.is_production:
        raise HTTPException(status_code=403, detail="Not available in production.")
    if isinstance(email_service.provider, DevelopmentEmailProvider):
        otp = email_service.provider.get_latest_otp(email, purpose)
        return {"email": email, "otp": otp}
    return {"email": email, "otp": None}
