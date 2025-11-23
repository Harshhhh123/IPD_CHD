# Use Python 3.11 slim (compatible with scikit-learn 1.5.1)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for compilation
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    gfortran \
    libgomp1 \
    make \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Install Python dependencies with increased timeout
# Split into chunks to avoid timeout
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --timeout=1000 \
    fastapi uvicorn[standard] pydantic python-multipart && \
    pip install --no-cache-dir --timeout=1000 \
    numpy pandas joblib && \
    pip install --no-cache-dir --timeout=1000 \
    scikit-learn==1.5.1 && \
    pip install --no-cache-dir --timeout=1000 \
    xgboost lightgbm catboost && \
    pip install --no-cache-dir --timeout=1000 \
    shap

# Copy application code and model files
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]