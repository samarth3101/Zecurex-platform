<h1 align="center">
  🛡️ Zecure — AI Payment Risk Intelligence Platform
</h1>

<p align="center">
  <b>Enterprise Payment Risk Manager with Point-in-Time Behavioral Features, ML Scoring, Deterministic Policy Boundaries, and Grounded Gemini Investigations</b>
</p>

<p align="center">
  <i>Developed for Razorpay Buildathon Track 02 — AI Risk Manager</i>
</p>

---

## 📌 Architectural Overview

Zecure is a real-time payment risk intelligence platform architected around a strict principle:
> **"AI recommends. Deterministic policy decides."**

```
Payment / Webhook Payload
           ↓
46 Point-in-Time Behavioral Features (Velocity, Deviation, Device Risk, Network)
           ↓
Calibrated Random Forest ML Model (< 15ms inference)
           ↓
Deterministic Risk Policy Boundary
    ├── LOW (Score < 0.45)  →  ALLOW (Gemini Bypassed)
    ├── MEDIUM              →  MONITOR
    └── REVIEW (Score ≥ 0.45) →  AI Investigation Agent (Gemini 2.5 Flash)
                                     ↓
                               Structured Evidence Grounding (100% Provenance-Linked)
                                     ↓
                               PostgreSQL Persistence + Tamper-Evident Audit Event Trail
                                     ↓
                               Live Control Room Synchronization
```

---

## ✨ Core Features

1. **46 Point-in-Time Behavioral Features**: Evaluates transaction velocity (1m/5m/1h/24h), historical deviation, IP/geo risk, and cardholder anomalies.
2. **ML Risk Engine**: Calibrated Random Forest inference trained on synthesized point-in-time transaction patterns.
3. **Deterministic Policy Boundary**: Authoritative thresholds (`ALLOW`, `REVIEW`, `CRITICAL`) enforced centrally in code.
4. **Conditional AI Investigation**: Gemini 2.5 Flash triggered strictly for `REVIEW` decisions, outputting structured JSON reasoning, evidence signals, and bounded action recommendations (`ALLOW`, `MONITOR`, `REVIEW`, `ESCALATE`).
5. **PostgreSQL Persistence & Audit Trail**: Structured event logging recording every decision, model score, feature breakdown, and investigation diff.
6. **Enterprise Authentication & Security**:
   - Primary credentials: Email + Scrypt-hashed password.
   - Untrusted device detection with 6-digit email OTP step-up verification.
   - 30-day trusted device persistence.
   - One-time recovery codes.
   - Server-side session management with immediate revocation.
   - Production security guardrails preventing dev passcodes or unverified email providers.
7. **Real-Time Control Room**: High-density fintech dashboard featuring live transaction feeds, deep behavioral diagnostics, risk simulation sandbox, and ML performance metrics.

---

## 🚀 Quickstart & Local Deployment

### 1. Prerequisites
- Python 3.12+
- Node.js 20+ & npm
- PostgreSQL 15+ (or Docker)

### 2. Environment Setup
Copy the environment template:
```bash
cp .env.example apps/api/.env
```

Ensure `apps/api/.env` contains your database connection string and optional Gemini API key:
```env
ENVIRONMENT=development
AUTH_ENV=development
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/zecure
CORS_ORIGINS=http://localhost:3000
EMAIL_PROVIDER=development
AUTH_SESSION_SECRET=zecure-session-secret-key-change-in-production-32bytes
AI_PROVIDER_API_KEY=your_gemini_api_key_here
```

### 3. Database Migrations
Initialize and upgrade the PostgreSQL schema:
```bash
cd apps/api
source .venv/bin/activate
alembic upgrade head
```

### 4. Running the Backend
```bash
cd apps/api
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Running the Frontend
```bash
cd apps/web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

To launch the complete platform (PostgreSQL + FastAPI + Next.js) with Docker Compose:

```bash
docker compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000/api/v1`
- **Health Check**: `http://localhost:8000/health`

---

## 🔒 Security & Authentication Model

- **Development Mode (`AUTH_ENV=development`)**:
  - Automatically seeds dev operator: `operator@zecure.one` (Password: `dev2024`).
  - OTPs logged to stdout with `[ZECURE DEV EMAIL]` header and available via `/api/v1/auth/dev/latest-otp`.
- **Production Mode (`AUTH_ENV=production`)**:
  - `dev2024` passcode is **STRICTLY REJECTED** (401 Unauthorized).
  - Dev OTP inspection endpoint is **STRICTLY BLOCKED** (403 Forbidden).
  - `DevelopmentEmailProvider` raises a fatal startup error if active.
  - Requires database-backed sessions with `HttpOnly`, `SameSite=Lax`, `Secure` cookies.

---

## 🧪 Verification & Testing

### Run Backend Tests (26/26):
```bash
cd apps/api
.venv/bin/python -m pytest tests/ -v
```

### Run Frontend Production Build:
```bash
cd apps/web
npm run build
```

---

## 👨‍💻 Author & Project Info

- **Developer**: Samarth Patil
- **GitHub**: [https://github.com/samarth3101](https://github.com/samarth3101)
- **Portfolio**: [https://samarthppatil.netlify.app/](https://samarthppatil.netlify.app/)
- **Email**: [samarth.patil3101@gmail.com](mailto:samarth.patil3101@gmail.com)
- **License**: MIT
