import logging
from typing import Dict, Any, Optional
import httpx

from app.services.email.provider import EmailProvider
from app.core.config import settings

logger = logging.getLogger("zecure.email.resend")

class ResendEmailProvider(EmailProvider):
    """
    Production Email Provider using the official Resend HTTP REST API.
    Sends transaction alerts, OTPs, and password reset links via Resend.
    """

    RESEND_API_URL = "https://api.resend.com/emails"

    def __init__(self, api_key: Optional[str] = None, default_from: Optional[str] = None):
        self.api_key = api_key or settings.RESEND_API_KEY
        if not self.api_key:
            raise ValueError("RESEND_API_KEY is required for ResendEmailProvider.")
        self.default_from = default_from or settings.EMAIL_FROM or "onboarding@resend.dev"

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Dispatches an email asynchronously to Resend.
        """
        payload = {
            "from": self.default_from,
            "to": [to_email],
            "subject": subject,
            "text": body_text,
        }
        if body_html:
            payload["html"] = body_html

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    self.RESEND_API_URL,
                    json=payload,
                    headers=headers
                )
                if response.status_code in (200, 201):
                    logger.info("Email sent successfully via Resend to %s (subject: %s)", to_email, subject)
                    return True
                else:
                    logger.error(
                        "Resend API error [%d]: %s",
                        response.status_code,
                        response.text
                    )
                    return False
        except Exception as exc:
            logger.error("Failed to dispatch email via Resend to %s: %s", to_email, str(exc))
            return False
