import pytest
import httpx
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.email.resend_provider import ResendEmailProvider
from app.services.email.email_service import EmailService
from app.services.email.dev_provider import DevelopmentEmailProvider
from app.core.config import settings

@pytest.mark.asyncio
async def test_resend_provider_initialization():
    provider = ResendEmailProvider(api_key="re_test_12345", default_from="onboarding@resend.dev")
    assert provider.api_key == "re_test_12345"
    assert provider.default_from == "onboarding@resend.dev"

@pytest.mark.asyncio
async def test_resend_provider_missing_api_key_fails():
    with patch.object(settings, "RESEND_API_KEY", None):
        with pytest.raises(ValueError, match="RESEND_API_KEY is required"):
            ResendEmailProvider(api_key=None)

@pytest.mark.asyncio
async def test_resend_provider_email_request_construction():
    provider = ResendEmailProvider(api_key="re_test_abcdef", default_from="security@zecure.one")

    mock_response = MagicMock(spec=httpx.Response)
    mock_response.status_code = 200
    mock_response.json.return_value = {"id": "email_123"}

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response

        success = await provider.send_email(
            to_email="merchant@example.com",
            subject="[Zecure] Verification Code",
            body_text="Your OTP is 123456",
            body_html="<p>Your OTP is <b>123456</b></p>"
        )

        assert success is True
        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args.kwargs
        assert call_kwargs["json"]["from"] == "security@zecure.one"
        assert call_kwargs["json"]["to"] == ["merchant@example.com"]
        assert call_kwargs["json"]["subject"] == "[Zecure] Verification Code"
        assert call_kwargs["json"]["text"] == "Your OTP is 123456"
        assert call_kwargs["json"]["html"] == "<p>Your OTP is <b>123456</b></p>"
        assert call_kwargs["headers"]["Authorization"] == "Bearer re_test_abcdef"

@pytest.mark.asyncio
async def test_email_service_selects_resend():
    with patch.object(settings, "EMAIL_PROVIDER", "resend"), \
         patch.object(settings, "RESEND_API_KEY", "re_test_key_xyz"):
        service = EmailService()
        assert isinstance(service.provider, ResendEmailProvider)
        assert service.provider.api_key == "re_test_key_xyz"

@pytest.mark.asyncio
async def test_email_service_selects_development():
    with patch.object(settings, "EMAIL_PROVIDER", "development"):
        service = EmailService()
        assert isinstance(service.provider, DevelopmentEmailProvider)

@pytest.mark.asyncio
async def test_production_rejects_development_email_provider():
    from app.main import lifespan
    from fastapi import FastAPI

    app = FastAPI()
    with patch.object(settings, "ENVIRONMENT", "production"), \
         patch.object(settings, "EMAIL_PROVIDER", "development"), \
         patch.object(settings, "AUTH_SESSION_SECRET", "super-secret-production-key-32chars!!"):
        with pytest.raises(RuntimeError, match="EMAIL_PROVIDER=development cannot be used"):
            async with lifespan(app):
                pass

@pytest.mark.asyncio
async def test_production_accepts_resend_with_api_key():
    from app.main import lifespan
    from fastapi import FastAPI

    app = FastAPI()
    with patch.object(settings, "ENVIRONMENT", "production"), \
         patch.object(settings, "EMAIL_PROVIDER", "resend"), \
         patch.object(settings, "RESEND_API_KEY", "re_valid_api_key"), \
         patch.object(settings, "AUTH_SESSION_SECRET", "super-secret-production-key-32chars!!"):
        async with lifespan(app):
            # Lifespan enters and exits cleanly
            pass

@pytest.mark.asyncio
async def test_production_rejects_resend_without_api_key():
    from app.main import lifespan
    from fastapi import FastAPI

    app = FastAPI()
    with patch.object(settings, "ENVIRONMENT", "production"), \
         patch.object(settings, "EMAIL_PROVIDER", "resend"), \
         patch.object(settings, "RESEND_API_KEY", None), \
         patch.object(settings, "AUTH_SESSION_SECRET", "super-secret-production-key-32chars!!"):
        with pytest.raises(RuntimeError, match="RESEND_API_KEY must be configured"):
            async with lifespan(app):
                pass

def test_no_api_keys_in_frontend():
    import os
    import re
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../apps/web/src"))
    resend_key_pattern = re.compile(r"re_[a-zA-Z0-9]{20,}")
    gemini_key_pattern = re.compile(r"AIzaSy[a-zA-Z0-9_-]{33}")
    razorpay_live_pattern = re.compile(r"rzp_live_[a-zA-Z0-9]{14}")

    for root, _, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith((".ts", ".tsx", ".js", ".jsx")):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    assert not resend_key_pattern.search(content), f"Possible Resend API key in {file_path}"
                    assert not gemini_key_pattern.search(content), f"Possible Gemini API key in {file_path}"
                    assert not razorpay_live_pattern.search(content), f"Possible Razorpay live secret in {file_path}"
