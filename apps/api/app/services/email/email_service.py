from typing import Optional, Dict, Any
from app.core.config import settings
from app.services.email.provider import EmailProvider
from app.services.email.dev_provider import DevelopmentEmailProvider
from app.services.email.resend_provider import ResendEmailProvider
from app.services.email.smtp_provider import SmtpEmailProvider

class EmailService:
    """
    High-level Email Service for Zecure.
    Renders structured, dark fintech security email templates and dispatches them via the configured EmailProvider.
    """
    
    def __init__(self, provider: Optional[EmailProvider] = None):
        if provider:
            self.provider = provider
        else:
            provider_type = settings.EMAIL_PROVIDER.lower()
            if provider_type in ("development", "console", "dev"):
                self.provider = DevelopmentEmailProvider()
            elif provider_type == "resend":
                self.provider = ResendEmailProvider(
                    api_key=settings.RESEND_API_KEY,
                    default_from=settings.EMAIL_FROM
                )
            elif provider_type == "smtp":
                self.provider = SmtpEmailProvider(
                    host=settings.SMTP_HOST,
                    port=settings.SMTP_PORT,
                    user=settings.SMTP_USER,
                    password=settings.SMTP_PASSWORD,
                    use_tls=settings.SMTP_TLS,
                    default_from=settings.EMAIL_FROM
                )
            else:
                raise RuntimeError(f"Unknown or unconfigured email provider: {settings.EMAIL_PROVIDER}")

    def _render_html_template(self, title: str, headline: str, message: str, highlight_box: Optional[str] = None, footer_note: Optional[str] = None) -> str:
        """
        Generates a sleek, dark-mode fintech security email template matching Zecure branding.
        """
        box_html = f'<div style="background:#090d16; border:1px solid #1c2638; border-radius:6px; padding:16px; margin:20px 0; text-align:center; font-family:monospace; font-size:24px; letter-spacing:4px; color:#00d4ff; font-weight:bold;">{highlight_box}</div>' if highlight_box else ''
        footer_text = footer_note or "If you did not request this action, please secure your account immediately."
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>{title}</title>
        </head>
        <body style="background-color:#000000; color:#e2e8f0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; margin:0; padding:30px 20px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:540px; background:#080a0f; border:1px solid #182232; border-radius:8px; padding:32px;">
            <tr>
              <td>
                <div style="display:flex; align-items:center; margin-bottom:24px;">
                  <span style="font-size:18px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">ZECURE <span style="font-size:12px; color:#00d4ff; font-weight:600;">SECURITY</span></span>
                </div>
                <h2 style="font-size:20px; font-weight:600; color:#ffffff; margin:0 0 12px 0;">{headline}</h2>
                <p style="font-size:14px; line-height:1.6; color:#94a3b8; margin:0 0 16px 0;">{message}</p>
                {box_html}
                <hr style="border:none; border-top:1px solid #182232; margin:24px 0;">
                <p style="font-size:12px; color:#64748b; margin:0; line-height:1.5;">{footer_text}</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """

    async def send_verification_otp(self, email: str, code: str, expires_in_minutes: int = 10) -> bool:
        subject = f"[Zecure] {code} is your verification code"
        body_text = f"Your Zecure account verification code is: {code}\nThis code will expire in {expires_in_minutes} minutes."
        body_html = self._render_html_template(
            title="Verify Your Email",
            headline="Email Verification Code",
            message=f"Use the 6-digit code below to complete your registration. This code expires in {expires_in_minutes} minutes.",
            highlight_box=code,
            footer_note="If you did not attempt to register a Zecure account, please disregard this email."
        )
        return await self.provider.send_email(
            to_email=email,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            context={"otp": code, "purpose": "REGISTRATION"}
        )

    async def send_login_stepup_otp(self, email: str, code: str, device_name: str, ip_address: str, expires_in_minutes: int = 10) -> bool:
        subject = f"[Zecure Security] Login verification code: {code}"
        body_text = (
            f"A sign-in attempt was detected from a new or untrusted device:\n"
            f"Device: {device_name}\nIP Address: {ip_address}\n\n"
            f"Your one-time authorization code is: {code}\n"
            f"This code will expire in {expires_in_minutes} minutes."
        )
        body_html = self._render_html_template(
            title="New Device Login Verification",
            headline="Device Verification Required",
            message=f"A sign-in attempt was detected from <strong>{device_name}</strong> (IP: {ip_address}). Enter this verification code to authorize access.",
            highlight_box=code,
            footer_note="If this wasn't you, your credentials may be compromised. Reset your password immediately."
        )
        return await self.provider.send_email(
            to_email=email,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            context={"otp": code, "purpose": "LOGIN_STEPUP", "device": device_name, "ip": ip_address}
        )

    async def send_password_reset_otp(self, email: str, code: str, expires_in_minutes: int = 10) -> bool:
        subject = f"[Zecure] Password reset code: {code}"
        body_text = f"Your password reset verification code is: {code}\nThis code will expire in {expires_in_minutes} minutes."
        body_html = self._render_html_template(
            title="Reset Your Password",
            headline="Password Reset Request",
            message=f"We received a request to reset your Zecure operator password. Use the code below to proceed. Valid for {expires_in_minutes} minutes.",
            highlight_box=code,
            footer_note="If you did not request a password reset, you can safely ignore this email."
        )
        return await self.provider.send_email(
            to_email=email,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            context={"otp": code, "purpose": "PASSWORD_RESET"}
        )

    async def send_password_changed_alert(self, email: str, timestamp: str) -> bool:
        subject = "[Zecure Security Alert] Your password was updated"
        body_text = f"Your Zecure operator account password was successfully updated at {timestamp}.\nAll previous active sessions have been revoked."
        body_html = self._render_html_template(
            title="Password Changed",
            headline="Security Notice: Password Updated",
            message=f"Your Zecure operator password was updated at {timestamp}. For security, all other active sessions have been terminated.",
            footer_note="If you did not make this change, contact support immediately."
        )
        return await self.provider.send_email(
            to_email=email,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            context={"purpose": "PASSWORD_CHANGED", "timestamp": timestamp}
        )

# Global singleton
email_service = EmailService()
