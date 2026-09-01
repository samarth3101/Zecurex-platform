import pytest
from httpx import AsyncClient
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_registration_flow_success(async_client: AsyncClient):
    # 1. Register a new user
    reg_payload = {
        "email": "analyst.test@zecure.one",
        "password": "SecurePassword123!",
        "name": "Test Analyst"
    }
    response = await async_client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "registration_pending"
    assert "dev_otp" in data and data["dev_otp"] is not None
    otp = data["dev_otp"]

    # 2. Verify with wrong OTP
    wrong_verify = await async_client.post("/api/v1/auth/verify-registration", json={
        "email": "analyst.test@zecure.one",
        "code": "000000"
    })
    assert wrong_verify.status_code == 400

    # 3. Verify with correct OTP
    verify_resp = await async_client.post("/api/v1/auth/verify-registration", json={
        "email": "analyst.test@zecure.one",
        "code": otp
    })
    assert verify_resp.status_code == 200
    v_data = verify_resp.json()
    assert v_data["status"] == "authenticated"
    assert v_data["user"]["email"] == "analyst.test@zecure.one"
    assert v_data["user"]["email_verified"] is True
    assert "recovery_codes" in v_data
    assert len(v_data["recovery_codes"]) == 8

@pytest.mark.asyncio
async def test_registration_weak_password(async_client: AsyncClient):
    response = await async_client.post("/api/v1/auth/register", json={
        "email": "weak@zecure.one",
        "password": "short"
    })
    assert response.status_code in (400, 422)

@pytest.mark.asyncio
async def test_registration_duplicate_email(async_client: AsyncClient):
    payload = {
        "email": "dup.test@zecure.one",
        "password": "SecurePassword123!",
        "name": "Dup User"
    }
    # First registration + verify
    r1 = await async_client.post("/api/v1/auth/register", json=payload)
    otp = r1.json()["dev_otp"]
    await async_client.post("/api/v1/auth/verify-registration", json={
        "email": "dup.test@zecure.one",
        "code": otp
    })

    # Second registration with same email
    r2 = await async_client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 400
    assert "already exists" in r2.json()["detail"]
