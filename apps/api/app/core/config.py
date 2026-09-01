from typing import List, Union, Optional
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str
    TEST_DATABASE_URL: Optional[str] = None
    CORS_ORIGINS: str = "http://localhost:3000"
    
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    
    AI_PROVIDER_API_KEY: str = ""

    # Authentication & Security
    AUTH_ENV: str = "development"
    AUTH_SESSION_SECRET: str = "zecure-session-secret-key-change-in-production-32bytes"
    SESSION_MAX_AGE_SECONDS: int = 86400 * 7  # 7 days
    TRUSTED_DEVICE_DAYS: int = 30
    OTP_EXPIRE_MINUTES: int = 10
    MAX_OTP_ATTEMPTS: int = 5

    # Email Provider Abstraction
    EMAIL_PROVIDER: str = "development"  # "development", "console", "smtp"
    EMAIL_FROM: str = "security@zecure.one"
    APP_BASE_URL: str = "http://localhost:3000"

    # SMTP Configuration (for future Gmail/SMTP integration)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production" or self.AUTH_ENV.lower() == "production"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

settings = Settings()
