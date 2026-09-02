from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import risk, investigations, dashboard, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Production startup security validation
    if settings.is_production:
        if settings.EMAIL_PROVIDER.lower() in ("development", "console", "dev"):
            raise RuntimeError(
                "CRITICAL SECURITY CONFIGURATION: EMAIL_PROVIDER=development cannot be used when running in production mode. "
                "Configure a valid production email provider such as EMAIL_PROVIDER=smtp or EMAIL_PROVIDER=resend."
            )
        if settings.EMAIL_PROVIDER.lower() == "resend" and not settings.RESEND_API_KEY:
            raise RuntimeError(
                "CRITICAL SECURITY CONFIGURATION: RESEND_API_KEY must be configured when running with EMAIL_PROVIDER=resend in production."
            )
        if settings.EMAIL_PROVIDER.lower() == "smtp" and not (settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD):
            raise RuntimeError(
                "CRITICAL SECURITY CONFIGURATION: SMTP_HOST, SMTP_USER, and SMTP_PASSWORD must be configured when running with EMAIL_PROVIDER=smtp in production."
            )
        if "change-in-production" in settings.AUTH_SESSION_SECRET:
            raise RuntimeError(
                "CRITICAL SECURITY CONFIGURATION: AUTH_SESSION_SECRET must be updated with a secure 32+ character random secret in production."
            )
    yield

app = FastAPI(
    title="Zecure API",
    description="AI Risk Manager for Razorpay Merchants",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

app.include_router(auth.router, prefix="/api/v1")
app.include_router(risk.router, prefix="/api/v1")
app.include_router(investigations.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
