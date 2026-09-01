import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_stepup_and_trusted_device_flow(async_client: AsyncClient):
    email = "device.test@zecure.one"
    password = "SecurePassword123!"

    # 1. Register & Verify
    r = await async_client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "name": "Device Tester"
    })
    otp = r.json()["dev_otp"]
    await async_client.post("/api/v1/auth/verify-registration", json={
        "email": email,
        "code": otp
    })

    # 2. Login from New / Untrusted Device
    login_resp = await async_client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    }, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0"})

    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["status"] == "requires_verification"
    assert "dev_otp" in login_data
    stepup_otp = login_data["dev_otp"]

    # 3. Verify Step-Up OTP and Trust Device
    verify_resp = await async_client.post("/api/v1/auth/verify-login", json={
        "email": email,
        "code": stepup_otp,
        "trust_device": True
    }, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0"})

    assert verify_resp.status_code == 200
    assert verify_resp.json()["status"] == "authenticated"
    assert "zecure_admin_token" in verify_resp.cookies

    # 4. Subsequent Login from the Same (Now Trusted) Device
    trusted_login = await async_client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    }, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0"})

    assert trusted_login.status_code == 200
    # Should authenticate immediately without requiring step-up OTP
    assert trusted_login.json()["status"] == "authenticated"
    assert "zecure_admin_token" in trusted_login.cookies

@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client: AsyncClient):
    response = await async_client.post("/api/v1/auth/login", json={
        "email": "unknown@zecure.one",
        "password": "WrongPassword123!"
    })
    assert response.status_code == 401
