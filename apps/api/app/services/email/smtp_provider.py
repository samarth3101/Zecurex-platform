import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional, List

from app.services.email.provider import EmailProvider
from app.core.config import settings

logger = logging.getLogger("zecure.email.smtp")

class SmtpEmailProvider(EmailProvider):
    """
    Production Email Provider using standard SMTP (Brevo, Gmail, AWS SES, SendGrid, Zoho).
    Implements intelligent multi-port auto-failover (e.g. 2525, 465, 587) to bypass cloud host port blocks.
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

    def _get_candidate_ports(self) -> List[int]:
        """
        Builds a prioritized list of ports to try.
        Port 2525 and 465 are prioritized when 587 might be blocked by cloud firewalls.
        """
        ordered = [self.port, 2525, 465, 587]
        seen = set()
        candidates = []
        for p in ordered:
            if p and p not in seen:
                seen.add(p)
                candidates.append(p)
        return candidates

    def _send_sync(self, to_email: str, subject: str, body_text: str, body_html: Optional[str] = None) -> bool:
        """
        Synchronous SMTP dispatcher with intelligent multi-port failover executed inside asyncio.to_thread.
        """
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.default_from
        msg["To"] = to_email

        msg.attach(MIMEText(body_text, "plain", "utf-8"))
        if body_html:
            msg.attach(MIMEText(body_html, "html", "utf-8"))

        ports_to_try = self._get_candidate_ports()
        last_error: Optional[Exception] = None

        for port in ports_to_try:
            try:
                if port == 465:
                    # Direct SSL
                    with smtplib.SMTP_SSL(self.host, port, timeout=4.0) as server:
                        server.login(self.user, self.password)
                        server.send_message(msg)
                else:
                    # STARTTLS (e.g. 2525, 587)
                    with smtplib.SMTP(self.host, port, timeout=4.0) as server:
                        server.ehlo()
                        if self.use_tls:
                            server.starttls()
                            server.ehlo()
                        server.login(self.user, self.password)
                        server.send_message(msg)

                logger.info("Email successfully sent via SMTP to %s on port %d (subject: %s)", to_email, port, subject)
                return True
            except Exception as exc:
                last_error = exc
                logger.warning("SMTP attempt failed on port %d for %s: %s. Trying next available port...", port, to_email, str(exc))

        logger.error("All SMTP port attempts failed for %s. Final error: %s", to_email, str(last_error))
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
        Dispatches email asynchronously via worker thread with multi-port auto-retry.
        """
        return await asyncio.to_thread(
            self._send_sync,
            to_email=to_email,
            subject=subject,
            body_text=body_text,
            body_html=body_html
        )
