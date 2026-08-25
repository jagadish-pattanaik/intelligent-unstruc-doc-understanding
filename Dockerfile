FROM python:3.11-slim

WORKDIR /app

# Install ALL system dependencies required by docling and its sub-libraries.
# - libgl1, libglib2.0-0: required by OpenCV (used internally by docling)
# - tesseract-ocr, libtesseract-dev: required for OCR functionality in docling
# - libxcb1 and related: required to prevent X11/xcb crash in headless environment
# - libgomp1: required for parallel processing in ML libraries
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libfontconfig1 \
    libice6 \
    libxcb1 \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Tell Qt/OpenCV to run in offscreen mode (prevents X11 display crashes in Docker)
ENV QT_QPA_PLATFORM=offscreen

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files and directories (layout, ontology, etc.)
COPY . .

# Expose Hugging Face default port
EXPOSE 7860

# Run the API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
