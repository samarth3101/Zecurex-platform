from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class EmailProvider(ABC):
    """
    Abstract Base Class for email delivery in Zecure.
    Allows seamlessly swapping Development/Console providers for real SMTP, Gmail, Resend, or SendGrid providers.
    """
    
    @abstractmethod
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Sends an email message asynchronously.
        """
        pass
