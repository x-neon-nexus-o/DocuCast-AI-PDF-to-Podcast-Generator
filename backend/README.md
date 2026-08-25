# DocuCast Backend

FastAPI backend that converts PDF documents — including scanned/image-only PDFs via Tesseract OCR — into podcast-style educational audio.

## Pipeline (Updated with OCR)

PDF Upload → PDF Validation → PyPDF2 Text Extraction → **Tesseract OCR Fallback (if needed)** → Text Cleaning → Groq LLM → Podcast Script → Edge-TTS → FFmpeg Audio Optimization (mono, 64k) → Base64 MP3 → JSON Response → React Frontend

---

## Mandatory System Dependencies

Before running the backend, install these system-level packages. The Python packages (`pytesseract`, `pdf2image`, `Pillow`) are installed via `pip`, but `tesseract` itself must be installed as a system binary.

### 1. Tesseract OCR (Required for Scanned PDFs)

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install -y tesseract-ocr tesseract-ocr-eng libtesseract-dev
```

Verify installation:

```bash
tesseract --version
```

Expected output should include the version number (e.g., `tesseract 5.3.0`).

**macOS (Homebrew):**

```bash
brew install tesseract
brew install tesseract-lang  # optional: additional language data
```

Verify:

```bash
tesseract --version
```

**Windows (Windows 10 / 11):**

Option A — Official Installer:
1. Download the installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run the `.exe` and install to the default path (`C:\Program Files\Tesseract-OCR`).
3. Add `C:\Program Files\Tesseract-OCR` to your system `PATH`.

Option B — Using `choco` (Chocolatey):

```powershell
choco install tesseract
```

Verify in PowerShell or Command Prompt:

```cmd
tesseract --version
```

---

### 2. FFmpeg (Required for Audio Optimization)

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install -y ffmpeg
```

**macOS (Homebrew):**

```bash
brew install ffmpeg
```

**Windows:**

Download from https://ffmpeg.org/download.html and extract to a folder (e.g., `C:\ffmpeg`). Add the `bin` folder (`C:\ffmpeg\bin`) to your system `PATH`.

Verify:

```bash
ffmpeg -version
```

---

### 3. Python Environment & Python Packages

Create a virtual environment:

```bash
python -m venv .venv
```

**Windows:**

```powershell
.venv\Scripts\activate
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

Install all Python dependencies:

```bash
pip install -r requirements.txt
```

---

## Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
GROQ_API_KEY=your_actual_groq_api_key_here
GROQ_MODEL=llama3-8b-8192
MAX_FILE_SIZE_MB=10
MAX_PAGES=10
AUDIO_BITRATE=64k
AUDIO_CHANNELS=1
```

**Important Security Note:** `GROQ_API_KEY` is read only from `.env`. It is never exposed to the React frontend, never logged, and never returned in any API response.

---

## How OCR Works in This Backend

When a user uploads a PDF:

1. `PyPDF2` attempts to extract text directly from the PDF text layer.
2. If the extracted text is fewer than 10 characters (indicating a scanned/image-only document or missing text layer), the backend automatically falls back to **Tesseract OCR**.
3. The PDF pages are converted to images using `pdf2image` (at 200 DPI for optimal recognition quality).
4. Each image is processed by `pytesseract.image_to_string()` using Tesseract configuration `--psm 6` (assume a single uniform block of text).
5. The OCR text is then cleaned and passed through the same pipeline (Groq LLM, Edge-TTS, FFmpeg) as standard text-based PDFs.

**If Tesseract is not installed** but a scanned PDF is uploaded:
- The backend returns a clear user-friendly error message:
  > "This document does not contain extractable text. It may be a scanned/image-only PDF. Please install tesseract-ocr (system package) and ensure pytesseract, pdf2image, and Pillow are installed for OCR support. Refer to README.md for detailed installation instructions."

This ensures the user understands exactly what is missing rather than receiving a vague stack trace.

---

## Running the Backend

After all system dependencies and `.env` are configured:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will be available at:
- `http://localhost:8000/docs` (Swagger / OpenAPI documentation)
- `http://localhost:8000/redoc` (ReDoc documentation)
- `GET http://localhost:8000/api/health` (Health check)
- `POST http://localhost:8000/api/podcast/generate` (Main pipeline endpoint)

---

## API Endpoints (Detailed)

### Health Check

```
GET /api/health
```

Response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "message": "DocuCast backend is running."
}
```

### Generate Podcast (Multipart Upload)

```
POST /api/podcast/generate
```

Request:
- `Content-Type: multipart/form-data`
- Field: `file` (the PDF document)

Response (Success):

```json
{
  "success": true,
  "filename": "document.pdf",
  "script": "HOST: Welcome...\nEXPERT: Today we discuss...",
  "audio": "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YRAAAAC...",
  "audio_format": "mp3",
  "pages_processed": 5,
  "processing_time": 42.18,
  "audio_duration": 187.5,
  "model_used": "llama3-8b-8192"
}
```

Response (Error — for example, missing file or invalid PDF):

```json
{
  "success": false,
  "error": {
    "code": "PDF_EXTRACTION_ERROR",
    "message": "This document does not contain extractable text..."
  }
}
```

---

## Testing

The test suite uses `pytest` and fully mocks external APIs (Groq, Edge-TTS) so that automated tests never depend on real API keys or network availability.

```bash
pytest tests/ -v
```

Tests included (10 total):

1. `test_health_endpoint` — verifies `/api/health`
2. `test_valid_pdf_extraction` — verifies PyPDF2 text extraction
3. `test_empty_pdf_raises` — verifies error for empty PDFs
4. `test_text_cleaning` — verifies whitespace normalization
5. `test_build_prompt_contains_requirement` — verifies Groq prompt includes "Use ONLY information contained..."
6. `test_generate_script_success` — verifies Groq mock response
7. `test_groq_rate_limit_raises` — verifies `AI_RATE_LIMIT` error code
8. `test_tts_synthesis` — verifies Edge-TTS mock
9. `test_voice_map` — verifies voice mapping to Edge-TTS voices
10. `test_complete_pipeline_mocked` — full end-to-end mock flow

---

## Security & Safety Features

- **File Validation:** Extension (`.pdf`), MIME type (`application/pdf` or `application/octet-stream`), file size (`MAX_FILE_SIZE_MB`), and valid PDF structure.
- **Safe Filenames:** All uploaded files are saved with UUID-based names (e.g., `a1b2c3d4.pdf`). Original filenames are never used as file paths.
- **Environment Isolation:** `GROQ_API_KEY` is never exposed in responses, never logged fully, and never passed to the frontend.
- **CORS Restrictions:** Only `http://localhost:5173` (development frontend) is permitted.
- **Cleanup Guarantee:** Temporary files (`temp/*.pdf`, `temp/*.mp3`, optimized outputs) are removed in `finally` blocks — even when processing fails.
- **No Arbitrary File Paths:** User input is never used to construct file system paths outside of the dedicated `temp/` directory.
- **No Database:** The MVP does not use a database; no persistent storage of user data or audio files.
- **Meaningful Errors:** All errors return structured JSON with a user-friendly message and an internal code (e.g., `PDF_EXTRACTION_ERROR`, `AI_RATE_LIMIT`, `TTS_ERROR`). Stack traces are never exposed.

---

## Logging

The backend logs the following events:

- Upload received (filename, size)
- PDF extraction started / completed / failed
- Groq request started / completed / retried
- TTS synthesis started / completed
- FFmpeg optimization started / completed
- Total pipeline processing time
- Errors (with code, not full stack traces in production responses)

The backend **never logs:**
- `GROQ_API_KEY`
- Sensitive document contents (only character counts and page counts)
- Complete Base64 audio strings

---

## Frontend Integration Details

The React frontend (`src/services/api.ts`) sends `multipart/form-data` to `POST /api/podcast/generate`. The `UploadZone` component now stores the actual `File` object (`uploadedFileRaw`) in `AppContext`. When the user reaches the final processing step, the `Processing` screen calls the backend. If the backend returns a successful response:

- A `Podcast` object is constructed from the response.
- The script text is parsed into `ScriptLine[]` objects.
- The Base64 audio (`audio`) and format (`audio_format`) are attached to the podcast object (`audioBase64`, `audioFormat`).
- The `AudioPlayer` component's download buttons now create real `data:audio/mp3;base64,...` downloads when `audioBase64` is present.

---

## Limitations (Clearly Documented for MVP)

- **Page Limit:** Only the first 10 pages are processed (`MAX_PAGES`).
- **No Persistent Storage:** Audio and results are not stored in a database or cloud storage; they exist only in the JSON response.
- **Base64 Transfer:** Audio is embedded as Base64 in JSON. This is appropriate for an MVP but should be replaced with object storage (S3, GCS, etc.) for production-scale use.
- **OCR Quality:** Tesseract OCR quality depends on the image resolution and language of the scanned document. Low-resolution scans or handwritten text may not be recognized accurately.
- **No Multi-Language OCR Data by Default:** The default installation includes English (`tesseract-ocr-eng`). For other languages, install the corresponding `tesseract-ocr-<lang>` package (e.g., `tesseract-ocr-hin` for Hindi, `tesseract-ocr-mar` for Marathi).
- **Audio Player Simulation:** The `AudioPlayer` component uses a simulated timer (`setInterval`) for progress display. The actual MP3 download uses the real Base64 data from the backend.

---

## Quick Command Reference

```bash
# 1. System dependencies
sudo apt install -y ffmpeg tesseract-ocr tesseract-ocr-eng libtesseract-dev

# 2. Create and activate Python environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 3. Install Python packages
pip install -r requirements.txt

# 4. Configure API key
cp .env.example .env
# Edit .env with your GROQ_API_KEY

# 5. Verify Tesseract
which tesseract || echo "Install tesseract-ocr first!"
tesseract --version

# 6. Verify FFmpeg
ffmpeg -version

# 7. Run tests
pytest tests/ -v

# 8. Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 9. Start frontend (in separate terminal, from repo root)
npm install
npm run dev
```
