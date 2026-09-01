import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_session_lifecycle_and_revocation(async_client: AsyncClient):
    email = "session.test@zecure.one"
    password = "SecurePassword123!"

    # 1. Register & Verify
    r = await async_client.post("/api/v1/auth/register", json={"email": email, "password": password})
    otp = r.json()["dev_otp"]
    await async_client.post("/api/v1/auth/verify-registration", json={"email": email, "code": otp})

    # 2. Login from Device 1
    l1 = await async_client.post("/api/v1/auth/login", json={"email": email, "password": password}, headers={"User-Agent": "Device1-Agent"})
    otp1 = l1.json()["dev_otp"]
    v1 = await async_client.post("/api/v1/auth/verify-login", json={"email": email, "code": otp1}, headers={"User-Agent": "Device1-Agent"})
    token1 = v1.cookies.get("zecure_admin_token")

    # 3. Login from Device 2
    l2 = await async_client.post("/api/v1/auth/login", json={"email": email, "password": password}, headers={"User-Agent": "Device2-Agent"})
    otp2 = l2.json()["dev_otp"]
    v2 = await async_client.post("/api/v1/auth/verify-login", json={"email": email, "code": otp2}, headers={"User-Agent": "Device2-Agent"})
    token2 = v2.cookies.get("zecure_admin_token")

    # 4. Get active sessions using Device 2's token
    async_client.cookies.set("zecure_admin_token", token2)
    sessions_resp = await async_client.get("/api/v1/auth/security/sessions")
    assert sessions_resp.status_code == 200
    sessions = sessions_resp.json()
    assert len(sessions) >= 2

    # Find device 1 session
    device1_session = next(s for s in sessions if not s["is_current"])
    device1_id = device1_session["id"]

    # 5. Revoke Device 1 session
    revoke_resp = await async_client.delete(f"/api/v1/auth/security/sessions/{device1_id}")
    assert revoke_resp.status_code == 200

    # 6. Try accessing protected endpoint with revoked token
    async_client.cookies.set("zecure_admin_token", token1)
    unauthorized_resp = await async_client.get("/api/v1/auth/me")
    assert unauthorized_resp.status_code == 401

    # 7. Device 2 token should still be valid
    async_client.cookies.set("zecure_admin_token", token2)
    valid_resp = await async_client.get("/api/v1/auth/me")
    assert valid_resp.status_code == 200

    # 8. Check Security Activity log
    activity_resp = await async_client.get("/api/v1/auth/security/activity")
    assert activity_resp.status_code == 200
    events = activity_resp.json()
    event_types = [e["event_type"] for e in events]
    assert "ACCOUNT_CREATED" in event_types
    assert "LOGIN_SUCCESS" in event_types
    assert "SESSION_REVOKED" in event_types
