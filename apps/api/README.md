# Zecure API Backend

FastAPI modular monolith backend for Zecure.

## Setup Instructions

1. **Create and activate the Python environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -e ".[dev]"
   ```

3. **Configure Environment:**
   Copy `.env.example` to `.env` and fill in the actual values.
   ```bash
   cp .env.example .env
   ```
   *Note: For local development, you must have a running PostgreSQL instance.*

4. **Initialize Database Migrations:**
   (If not already initialized)
   ```bash
   alembic upgrade head
   ```

5. **Start FastAPI Development Server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`.

## Testing

Run tests with pytest:
```bash
pytest
```
