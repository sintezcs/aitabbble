# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_CACHE_DIR=/app/.uv-cache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Set work directory
WORKDIR /app

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies from lock file (no dev dependencies)
RUN uv sync --locked --no-dev

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Create a non-root user
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Use uv run to execute with the project environment
CMD ["uv", "run", "uvicorn", "app.aitabbble.application:app", "--host", "0.0.0.0", "--port", "8000"] 