import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from app.services.email.provider import EmailProvider
from app.core.config import settings

logger = logging.getLogger("zecure.email.dev")

class DevelopmentEmailProvider(EmailProvider):
    """
    Development email provider that safely logs OTPs and security alerts to the console / logger
    and caches recent messages in-memory for local testing.
    
    STRICT SAFETY:
    Fails immediately if used when settings.is_production is True.
    """
    
    def __init__(self):
        if settings.is_production:
            raise RuntimeError(
                "CRITICAL SECURITY CONFIGURATION ERROR: DevelopmentEmailProvider cannot be used in a production environment. "
                "Please configure a valid production email provider (e.g. SMTP / Gmail / Resend)."
            )
        self.sent_messages: List[Dict[str, Any]] = []

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> bool:
        if settings.is_production:
            raise RuntimeError("Cannot use DevelopmentEmailProvider in production mode.")

        ctx = context or {}
        otp = ctx.get("otp", "N/A")
        purpose = ctx.get("purpose", "SECURITY_NOTIFICATION")

        # Explicit development logger output
        dev_log = (
            f"\n==================== [ZECURE DEV EMAIL] ====================\n"
            f"  To:       {to_email}\n"
            f"  Subject:  {subject}\n"
            f"  Purpose:  {purpose}\n"
            f"  OTP Code: {otp}\n"
            f"  Time:     {datetime.now(timezone.utc).isoformat()}\n"
            f"============================================================\n"
        )
        print(dev_log)
        logger.info(dev_log)

        # Store in memory for dev retrieval
        self.sent_messages.append({
            "to": to_email,
            "subject": subject,
            "body_text": body_text,
            "body_html": body_html,
            "context": ctx,
            "timestamp": datetime.now(timezone.utc)
        })

        # Cap memory buffer
        if len(self.sent_messages) > 50:
            self.sent_messages.pop(0)

        return True

    def get_latest_otp(self, email: str, purpose: Optional[str] = None) -> Optional[str]:
        """
        Development-only helper to inspect the latest generated OTP for testing.
        """
        if settings.is_production:
            return None
        for msg in reversed(self.sent_messages):
            if msg["to"] == email:
                if purpose is None or msg.get("context", {}).get("purpose") == purpose:
                    return msg.get("context", {}).get("otp")
        return None
