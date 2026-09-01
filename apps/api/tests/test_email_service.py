import pytest
from app.services.email.dev_provider import DevelopmentEmailProvider
from app.services.email.email_service import EmailService
from app.core.config import settings

@pytest.mark.asyncio
async def test_development_email_provider():
    provider = DevelopmentEmailProvider()
    service = EmailService(provider=provider)

    # 1. Send OTP
    success = await service.send_verification_otp(
        email="dev.test@zecure.one",
        code="654321",
        expires_in_minutes=10
    )
    assert success is True

    # 2. Retrieve OTP from dev provider
    retrieved_otp = provider.get_latest_otp("dev.test@zecure.one", purpose="REGISTRATION")
    assert retrieved_otp == "654321"

def test_production_safety_check(monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    with pytest.raises(RuntimeError) as exc_info:
        DevelopmentEmailProvider()
    assert "DevelopmentEmailProvider cannot be used in a production environment" in str(exc_info.value)
