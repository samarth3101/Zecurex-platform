FROM python:3.12-slim

WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy python configuration and install dependencies
COPY apps/api/pyproject.toml /workspace/apps/api/
RUN pip install --no-cache-dir -e /workspace/apps/api

# Copy ML model artifacts and API application code
COPY ml /workspace/ml
COPY apps/api /workspace/apps/api

WORKDIR /workspace/apps/api

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
