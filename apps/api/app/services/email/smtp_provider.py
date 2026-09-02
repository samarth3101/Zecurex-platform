import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional

from app.services.email.provider import EmailProvider
from app.core.config import settings

logger = logging.getLogger("zecure.email.smtp")

class SmtpEmailProvider(EmailProvider):
    """
    Production Email Provider using standard SMTP (e.g. Gmail App Password, AWS SES, SendGrid, Zoho).
    Sends transaction alerts, OTPs, and password reset links to any recipient email address.
    """

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        use_tls: Optional[bool] = None,
        default_from: Optional[str] = None
    ):
        self.host = host or settings.SMTP_HOST
        self.port = port or settings.SMTP_PORT or 587
        self.user = user or settings.SMTP_USER
        self.password = password or settings.SMTP_PASSWORD
        self.use_tls = use_tls if use_tls is not None else settings.SMTP_TLS
        self.default_from = default_from or settings.EMAIL_FROM or self.user

        if not self.host or not self.user or not self.password:
            raise ValueError("SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required for SmtpEmailProvider.")

    def _send_sync(self, to_email: str, subject: str, body_text: str, body_html: Optional[str] = None) -> bool:
        """
        Synchronous SMTP dispatcher executed inside asyncio.to_thread.
        """
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.default_from
        msg["To"] = to_email

        msg.attach(MIMEText(body_text, "plain", "utf-8"))
        if body_html:
            msg.attach(MIMEText(body_html, "html", "utf-8"))

        try:
            if self.port == 465:
                # SSL connection
                with smtplib.SMTP_SSL(self.host, self.port, timeout=10.0) as server:
                    server.login(self.user, self.password)
                    server.send_message(msg)
            else:
                # Standard SMTP with STARTTLS
                with smtplib.SMTP(self.host, self.port, timeout=10.0) as server:
                    server.ehlo()
                    if self.use_tls:
                        server.starttls()
                        server.ehlo()
                    server.login(self.user, self.password)
                    server.send_message(msg)

            logger.info("Email sent successfully via SMTP to %s (subject: %s)", to_email, subject)
            return True
        except Exception as exc:
            logger.error("Failed to send email via SMTP to %s: %s", to_email, str(exc))
            return False

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Dispatches email asynchronously via worker thread.
        """
        return await asyncio.to_thread(
            self._send_sync,
            to_email=to_email,
            subject=subject,
            body_text=body_text,
            body_html=body_html
        )
