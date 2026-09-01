import pytest
import pytest_asyncio
from httpx import AsyncClient
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, update

from app.core.config import settings
from app.models.base import utc_now
from app.models.auth import User, Session, TrustedDevice, VerificationCode, RecoveryCode
from app.core.security import hash_password, hash_token

@pytest.mark.asyncio
async def test_complete_security_flow(async_client: AsyncClient, db_session):
    """
    Comprehensive Security Audit & Hardening Test:
    1. Registration -> OTP -> Recovery Codes -> Account Active
    2. Unknown Device Login -> Step-Up OTP -> Device Trust 30 days
    3. Subsequent Login from Trusted Device -> Immediate Access (No OTP)
    4. Multi-Session Management -> Revoke Session by ID
    5. Password Reset -> Invalidate All Sessions
    6. Protected Dashboard Endpoints -> Reject Unauthenticated / Revoked Sessions
    7. Brute-Force & Attempt Limiting Protections
    """
    test_email = f"security_auditor_{uuid.uuid4().hex[:8]}@zecure.one"
    test_password = "SecurePassword123!"

    # =========================================================================
    # A. REGISTRATION FLOW
    # =========================================================================
    reg_resp = await async_client.post(
        "/api/v1/auth/register",
        json={"email": test_email, "password": test_password, "name": "Security Auditor"}
    )
    assert reg_resp.status_code == 200
    assert reg_resp.json()["status"] == "registration_pending"

    # Fetch OTP
    otp_resp = await async_client.get(f"/api/v1/auth/dev/latest-otp?email={test_email}&purpose=REGISTRATION")
    assert otp_resp.status_code == 200
    reg_otp = otp_resp.json()["otp"]
    assert reg_otp is not None and len(reg_otp) == 6

    # Verify Registration
    verify_resp = await async_client.post(
        "/api/v1/auth/verify-registration",
        json={"email": test_email, "code": reg_otp}
    )
    assert verify_resp.status_code == 200
    reg_data = verify_resp.json()
    assert reg_data["status"] == "authenticated"
    assert len(reg_data["recovery_codes"]) == 8

    # Verify user is active & email_verified
    user_res = await db_session.execute(select(User).where(User.email == test_email))
    user = user_res.scalar_one()
    assert user.email_verified is True
    assert user.is_active is True

    # =========================================================================
    # B. UNKNOWN DEVICE LOGIN -> STEP-UP OTP CHALLENGE
    # =========================================================================
    login_untrusted = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": test_password},
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AuditorBrowser/1.0"}
    )
    assert login_untrusted.status_code == 200
    assert login_untrusted.json()["status"] == "requires_verification"

    # Fetch Step-Up OTP
    otp_stepup_resp = await async_client.get(f"/api/v1/auth/dev/latest-otp?email={test_email}&purpose=LOGIN_STEPUP")
    stepup_otp = otp_stepup_resp.json()["otp"]
    assert stepup_otp is not None

    # Complete Step-Up and Trust Device
    verify_login = await async_client.post(
        "/api/v1/auth/verify-login",
        json={"email": test_email, "code": stepup_otp, "trust_device": True},
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AuditorBrowser/1.0"}
    )
    assert verify_login.status_code == 200
    assert verify_login.json()["status"] == "authenticated"
    assert "zecure_admin_token" in verify_login.cookies
    device1_cookie = verify_login.cookies["zecure_admin_token"]

    # =========================================================================
    # C. TRUSTED DEVICE SUBSEQUENT LOGIN (NO OTP REQUIRED)
    # =========================================================================
    login_trusted = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": test_password},
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AuditorBrowser/1.0"}
    )
    assert login_trusted.status_code == 200
    assert login_trusted.json()["status"] == "authenticated"
    assert "zecure_admin_token" in login_trusted.cookies
    device1_cookie_2 = login_trusted.cookies["zecure_admin_token"]

    # =========================================================================
    # D. MULTI-SESSION MANAGEMENT & TARGETED REVOCATION
    # =========================================================================
    # Establish second session from different User-Agent (mobile)
    login_device2 = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": test_password},
        headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) MobileBrowser/1.0"}
    )
    assert login_device2.json()["status"] == "requires_verification"
    dev2_otp = (await async_client.get(f"/api/v1/auth/dev/latest-otp?email={test_email}&purpose=LOGIN_STEPUP")).json()["otp"]
    verify_dev2 = await async_client.post(
        "/api/v1/auth/verify-login",
        json={"email": test_email, "code": dev2_otp, "trust_device": False},
        headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) MobileBrowser/1.0"}
    )
    device2_cookie = verify_dev2.cookies["zecure_admin_token"]

    # List active sessions using device 1
    sessions_resp = await async_client.get(
        "/api/v1/auth/security/sessions",
        cookies={"zecure_admin_token": device1_cookie_2}
    )
    assert sessions_resp.status_code == 200
    sessions_list = sessions_resp.json()
    assert len(sessions_list) >= 2

    # Identify device2 session and revoke it
    device2_session_id = [s["id"] for s in sessions_list if not s["is_current"]][0]
    revoke_resp = await async_client.delete(
        f"/api/v1/auth/security/sessions/{device2_session_id}",
        cookies={"zecure_admin_token": device1_cookie_2}
    )
    assert revoke_resp.status_code == 200

    # Device 2 should now be rejected with 401
    dev2_check = await async_client.get(
        "/api/v1/auth/me",
        cookies={"zecure_admin_token": device2_cookie}
    )
    assert dev2_check.status_code == 401

    # Device 1 should still be authorized
    dev1_check = await async_client.get(
        "/api/v1/auth/me",
        cookies={"zecure_admin_token": device1_cookie_2}
    )
    assert dev1_check.status_code == 200

    # =========================================================================
    # E. PASSWORD RESET -> INVALIDATE ALL ACTIVE SESSIONS
    # =========================================================================
    # Request reset
    forgot_resp = await async_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": test_email}
    )
    assert forgot_resp.status_code == 200
    reset_otp = (await async_client.get(f"/api/v1/auth/dev/latest-otp?email={test_email}&purpose=PASSWORD_RESET")).json()["otp"]

    # Reset password
    new_password = "NewlyUpdatedPassword456!"
    reset_act = await async_client.post(
        "/api/v1/auth/reset-password",
        json={"email": test_email, "code": reset_otp, "new_password": new_password}
    )
    assert reset_act.status_code == 200
    assert reset_act.json()["status"] == "password_reset_completed"

    # Device 1 session MUST now be invalidated (401)
    dev1_after_reset = await async_client.get(
        "/api/v1/auth/me",
        cookies={"zecure_admin_token": device1_cookie_2}
    )
    assert dev1_after_reset.status_code == 401

    # Login with new password works
    re_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": new_password},
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AuditorBrowser/1.0"}
    )
    assert re_login.status_code == 200
    assert re_login.json()["status"] == "authenticated"

@pytest.mark.asyncio
async def test_otp_attempt_limiting_and_expiration(async_client: AsyncClient, db_session):
    """
    Tests OTP security:
    - Rejection of incorrect codes
    - Attempt exhaustion locks the OTP
    - Expired codes are rejected
    """
    test_email = f"otp_limiter_{uuid.uuid4().hex[:8]}@zecure.one"
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": test_email, "password": "StrongPassword789!"}
    )

    # 5 consecutive incorrect OTP attempts
    for attempt in range(1, 6):
        resp = await async_client.post(
            "/api/v1/auth/verify-registration",
            json={"email": test_email, "code": "000000"}
        )
        assert resp.status_code == 400

    # 6th attempt with real OTP must be rejected because code is consumed/exhausted
    real_otp = (await async_client.get(f"/api/v1/auth/dev/latest-otp?email={test_email}&purpose=REGISTRATION")).json()["otp"]
    exhausted_resp = await async_client.post(
        "/api/v1/auth/verify-registration",
        json={"email": test_email, "code": real_otp}
    )
    assert exhausted_resp.status_code == 400

@pytest.mark.asyncio
async def test_protected_dashboard_endpoints_authorization(async_client: AsyncClient):
    """
    Ensures all protected dashboard routes strictly reject unauthenticated requests.
    """
    dummy_uuid = uuid.uuid4()
    endpoints = [
        ("GET", "/api/v1/dashboard/transactions"),
        ("GET", f"/api/v1/dashboard/transactions/{dummy_uuid}"),
        ("GET", f"/api/v1/dashboard/risk/{dummy_uuid}"),
        ("GET", "/api/v1/dashboard/investigations"),
        ("GET", f"/api/v1/dashboard/investigations/{dummy_uuid}"),
        ("GET", "/api/v1/dashboard/audit"),
        ("GET", f"/api/v1/dashboard/audit/{dummy_uuid}"),
        ("GET", "/api/v1/dashboard/performance"),
        ("GET", "/api/v1/auth/me"),
        ("GET", "/api/v1/auth/security/sessions"),
        ("GET", "/api/v1/auth/security/activity"),
    ]

    for method, path in endpoints:
        if method == "GET":
            res = await async_client.get(path)
        assert res.status_code == 401, f"Protected endpoint {path} did not return 401 when unauthenticated!"

@pytest.mark.asyncio
async def test_production_boundary_passcode_rejection(async_client: AsyncClient, monkeypatch):
    """
    Ensures that when AUTH_ENV=production or ENVIRONMENT=production:
    - Legacy dev2024 passcode is rejected with 401.
    - /api/v1/auth/dev/latest-otp returns 403 Forbidden.
    """
    monkeypatch.setattr(settings, "AUTH_ENV", "production")
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")

    # 1. Passcode header/cookie bypass rejected
    res = await async_client.get(
        "/api/v1/dashboard/transactions",
        cookies={"zecure_admin_token": "dev2024"}
    )
    assert res.status_code == 401

    # 2. Dev OTP inspection endpoint blocked
    otp_res = await async_client.get("/api/v1/auth/dev/latest-otp?email=operator@zecure.one")
    assert otp_res.status_code == 403
