import pytest
from unittest.mock import MagicMock, patch
from app.services.email.smtp_provider import SmtpEmailProvider
from app.services.email.email_service import EmailService
from app.core.config import settings

def test_smtp_provider_initialization():
    provider = SmtpEmailProvider(
        host="smtp.gmail.com",
        port=587,
        user="test@gmail.com",
        password="app_password",
        use_tls=True,
        default_from="test@gmail.com"
    )
    assert provider.host == "smtp.gmail.com"
    assert provider.port == 587
    assert provider.user == "test@gmail.com"
    assert provider.password == "app_password"

def test_smtp_provider_missing_credentials_fails():
    with pytest.raises(ValueError, match="SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required"):
        SmtpEmailProvider(host="", user="", password="")

@pytest.mark.asyncio
async def test_smtp_send_email_mock():
    provider = SmtpEmailProvider(
        host="smtp.gmail.com",
        port=587,
        user="test@gmail.com",
        password="app_password",
        use_tls=True,
        default_from="test@gmail.com"
    )

    with patch("smtplib.SMTP") as mock_smtp:
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server

        success = await provider.send_email(
            to_email="recipient@gmail.com",
            subject="Test Subject",
            body_text="Test Body",
            body_html="<p>Test Body</p>"
        )

        assert success is True
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once_with("test@gmail.com", "app_password")
        mock_server.send_message.assert_called_once()

def test_email_service_selects_smtp(monkeypatch):
    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "smtp")
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setattr(settings, "SMTP_PORT", 587)
    monkeypatch.setattr(settings, "SMTP_USER", "test@gmail.com")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "secret")
    service = EmailService()
    assert isinstance(service.provider, SmtpEmailProvider)
