# AI Agent Studio Cloud Backend - Dockerfile
# Optimized for cloud deployment with Hugging Face integration

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    git \
    curl \
    wget \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /tmp/ai_studio_storage/videos \
    /tmp/ai_studio_storage/audio \
    /tmp/ai_studio_storage/images \
    /tmp/ai_studio_storage/code \
    /tmp/ai_studio_storage/text \
    /tmp/ai_studio_storage/temp

# Set permissions
RUN chmod +x /app/main.py

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7860/api/v1/health || exit 1

# Expose port
EXPOSE 7860

# Run the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]