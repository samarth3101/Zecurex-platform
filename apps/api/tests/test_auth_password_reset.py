import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_password_reset_and_session_invalidation(async_client: AsyncClient):
    email = "reset.test@zecure.one"
    old_password = "OldPassword123!"
    new_password = "NewSecurePassword456!"

    # 1. Register & Verify
    r = await async_client.post("/api/v1/auth/register", json={"email": email, "password": old_password})
    otp = r.json()["dev_otp"]
    await async_client.post("/api/v1/auth/verify-registration", json={"email": email, "code": otp})

    # 2. Login to establish session
    l = await async_client.post("/api/v1/auth/login", json={"email": email, "password": old_password})
    otp_l = l.json()["dev_otp"]
    v = await async_client.post("/api/v1/auth/verify-login", json={"email": email, "code": otp_l})
    old_token = v.cookies.get("zecure_admin_token")

    # 3. Forgot Password
    fp = await async_client.post("/api/v1/auth/forgot-password", json={"email": email})
    assert fp.status_code == 200
    assert "instructions have been sent" in fp.json()["message"]
    reset_otp = fp.json()["dev_otp"]

    # 4. Reset Password
    rp = await async_client.post("/api/v1/auth/reset-password", json={
        "email": email,
        "code": reset_otp,
        "new_password": new_password
    })
    assert rp.status_code == 200
    assert "successfully reset" in rp.json()["message"]

    # 5. Old session must now be INVALID
    async_client.cookies.set("zecure_admin_token", old_token)
    check_resp = await async_client.get("/api/v1/auth/me")
    assert check_resp.status_code == 401

    # 6. Old password must fail
    old_login = await async_client.post("/api/v1/auth/login", json={"email": email, "password": old_password})
    assert old_login.status_code == 401

    # 7. New password must succeed
    new_login = await async_client.post("/api/v1/auth/login", json={"email": email, "password": new_password})
    assert new_login.status_code == 200
