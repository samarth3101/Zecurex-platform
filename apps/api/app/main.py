from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import risk, investigations

app = FastAPI(
    title="Zecure API",
    description="AI Risk Manager for Razorpay Merchants",
    version="0.1.0"
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

app.include_router(risk.router, prefix="/api/v1")
app.include_router(investigations.router, prefix="/api/v1")
