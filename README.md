# 🎙️ DocuCast — AI PDF to Podcast Generator

Turn any PDF into a podcast-style audio episode. DocuCast extracts the text from your document, uses **Groq AI** to write a natural host-and-expert podcast script, and synthesizes it into an MP3 with **Edge-TTS** — then saves everything to **MongoDB** so your account, sessions, documents, and podcasts persist across visits.

![Stack](https://img.shields.io/badge/React-18-blue) ![Stack](https://img.shields.io/badge/FastAPI-1.1-orange) ![Stack](https://img.shields.io/badge/MongoDB-Motor-green) ![Stack](https://img.shields.io/badge/TTS-Edge--TTS-9cf)

---

## ✨ Features

- **PDF → Podcast pipeline** — upload a PDF, get a full spoken audio episode
- **User accounts stored in MongoDB** — sign up / log in with bcrypt-hashed passwords
- **Sessions stored in MongoDB** — server-side bearer tokens with automatic TTL expiry ("Remember me" = 30 days, default = 1 day)
- **Documents & podcasts persisted in MongoDB** — your library survives page refreshes and restarts
- **Per-user data isolation** — you only ever see your own documents and podcasts
- **Scanned-PDF OCR support** — falls back to Tesseract OCR when a PDF has no text layer
- **Polished React UI** — dashboard, documents, audio library, player, script viewer, search

---

## 🧱 Tech Stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Frontend  | React 18 + TypeScript + Vite + Tailwind CSS            |
| Backend   | Python 3.11+ · FastAPI · Uvicorn                       |
| Database  | MongoDB (async driver: **Motor** / PyMongo)            |
| AI        | Groq (`llama3-8b-8192` by default)                     |
| Text-to-Speech | Microsoft Edge-TTS                               |
| OCR       | Tesseract + pytesseract + pdf2image                    |
| Audio     | FFmpeg (mono, 64 kbps optimization)                    |

---

## ✅ Prerequisites

Install these **before** starting:

| Requirement | Version | Notes |
| ----------- | ------- | ----- |
| [Node.js](https://nodejs.org/) | **18+** (20/22 recommended) | includes `npm` |
| [Python](https://www.python.org/downloads/) | **3.11+** | 3.11–3.13 tested |
| [MongoDB](https://www.mongodb.com/docs/manual/installation/) | 7.x | local install, Docker, or Atlas (see [MongoDB setup](#-mongodb-setup)) |
| [FFmpeg](https://ffmpeg.org/download.html) | latest | audio optimization |
| [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) | latest + `eng` data | only needed for scanned/image-only PDFs |

### Install FFmpeg & Tesseract

**Ubuntu / Debian**
```bash
sudo apt update
sudo apt install -y ffmpeg tesseract-ocr tesseract-ocr-eng libtesseract-dev
```

**macOS (Homebrew)**
```bash
brew install ffmpeg tesseract
```

**Windows**
- FFmpeg: download from [ffmpeg.org](https://ffmpeg.org/download.html), extract, and add the `bin` folder to your `PATH`.
- Tesseract: use the official installer from the [UB-Mannheim builds](https://github.com/UB-Mannheim/tesseract/wiki) and add it to `PATH`.

Verify:
```bash
ffmpeg -version      # should print version info
tesseract --version  # should print version info (optional but recommended)
```

---

## 🗄️ MongoDB Setup

Pick **one** option:

### Option A — Docker (easiest)

```bash
docker run -d --name docucast-mongo \
  -p 27017:27017 \
  -v docucast-mongo-data:/data/db \
  mongo:7
```

### Option B — Local install

Follow the [official MongoDB installation guide](https://www.mongodb.com/docs/manual/installation/) for your OS, then start the server (on Linux, usually `sudo systemctl start mongod` or just `mongod`).

### Option C — MongoDB Atlas (cloud)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. In **Database Access**, create a database user.
3. In **Network Access**, allow your IP.
4. Copy the connection string (`mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/`).

> 💡 **No MongoDB? No problem (for development).** If `MONGODB_URI` is left blank and no MongoDB server is reachable at `localhost:27017`, the backend automatically switches to an **in-memory MongoDB emulator** so you can still try the app. Data is lost when the backend stops, and `/api/health` clearly reports which engine is active.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/x-neon-nexus-o/DocuCast-AI-PDF-to-Podcast-Generator.git
cd DocuCast-AI-PDF-to-Podcast-Generator
```

### 2. Set up the backend

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create your environment file
cp .env.example .env
```

Edit `backend/.env` and add your **Groq API key** (required for script generation — get one free at [console.groq.com](https://console.groq.com)):

```env
GROQ_API_KEY=your_actual_groq_api_key_here
GROQ_MODEL=llama3-8b-8192
MAX_FILE_SIZE_MB=10
MAX_PAGES=10
AUDIO_BITRATE=64k
AUDIO_CHANNELS=1

# Point at your MongoDB (local, Docker, or Atlas) for persistent storage:
#   MONGODB_URI=mongodb://localhost:27017        (local or Docker)
#   MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/   (Atlas)
# Leave MONGODB_URI blank and no server reachable -> in-memory emulator
# fallback (dev only, data is not persisted across restarts).
MONGODB_URI=
MONGODB_DB_NAME=docucast
MONGODB_SERVER_SELECTION_TIMEOUT_MS=2500
MONGODB_CONNECT_TIMEOUT_MS=2500

# Session lifetime in MongoDB (days)
SESSION_REMEMBER_DAYS=30
SESSION_DEFAULT_DAYS=1

# Comma-separated allowed origins for the browser
CORS_ORIGINS=http://localhost:5173
```

### 3. Start the backend

```bash
# From the backend/ folder, with the venv still active
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     MongoDB connected: mongodb://localhost:27017/docucast   (or the in-memory fallback warning)
```

- API docs (Swagger): http://localhost:8000/docs
- Health check (shows DB status): http://localhost:8000/api/health

### 4. Set up and start the frontend

Open a **second terminal**:

```bash
# From the repository root
npm install
npm run dev
```

The app opens at **http://localhost:5173**. The Vite dev server automatically proxies `/api/*` to the backend, so the browser only ever talks to the same origin.

---

## 📖 How to Use the App

1. **Create an account** — open http://localhost:5173, click **Sign up**, or use **Continue with Google** (demo account for now).
   - Your account is created in MongoDB with a bcrypt-hashed password, and a session token is stored in the `sessions` collection.
2. **Upload a PDF** — from the dashboard, click **Upload PDF**, choose a document (up to 10 MB), pick your style/length/voice settings, and start processing.
3. **Wait for the AI pipeline** — the app extracts the text (with OCR fallback for scans), writes a podcast script with Groq, and synthesizes the audio with Edge-TTS.
4. **Listen & download** — the result page has a full player; use **Download** to save the MP3.
5. **Your library** — every generated document and podcast is saved to MongoDB. The **Dashboard**, **My Documents**, and **Audio Library** pages reload them from the database on every visit. Rename, favorite, or delete — all changes persist.

### Demo login
| Field    | Value                 |
| -------- | --------------------- |
| Email    | `demo@docucast.app`   |
| Password | `demo1234`            |

(The "Continue with Google" button signs into this demo account automatically.)

---

## 🧪 Running the Tests

The backend test suite (24 tests) uses an in-memory MongoDB emulator — no live database or API keys needed:

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

Covers: authentication & sessions, per-user data isolation, document/podcast persistence, password hashing, TTL expiry, the full generation pipeline (mocked), and OCR/PDF extraction.

---

## 🗃️ What's Stored in MongoDB

| Collection  | Contents                                                        | Key indexes                                         |
| ----------- | --------------------------------------------------------------- | --------------------------------------------------- |
| `users`     | name, email (unique), bcrypt password hash, timestamps          | `email` (unique)                                    |
| `sessions`  | opaque bearer token, user id, `created_at`, `expires_at` (TTL)  | `token` (unique), `expires_at` (TTL auto-delete)    |
| `documents` | uploaded PDF metadata (name, pages, size, status, favorite…), owned by a user | `user_id + created_at`          |
| `podcasts`  | script, summary, chapters, audio (base64), owned by a user      | `user_id + created_at`                              |

> **Audio storage note:** audio is embedded as base64 in the podcast document. MongoDB documents are capped at 16 MB, so very long podcasts are returned for immediate playback/download but not persisted (the UI tells you when that happens). Production-scale storage would move audio to GridFS or an object store (S3/GCS).

---

## 🔌 API Overview

All endpoints (except signup/login) require `Authorization: Bearer <token>`.

| Method | Endpoint                       | Description                              |
| ------ | ------------------------------ | ---------------------------------------- |
| POST   | `/api/auth/signup`             | Create account + start session           |
| POST   | `/api/auth/login`              | Log in + start session                   |
| POST   | `/api/auth/logout`             | Destroy the session in MongoDB           |
| GET    | `/api/auth/me`                 | Current user                             |
| POST   | `/api/auth/change-password`    | Update password (invalidates sessions)   |
| GET    | `/api/documents`               | List my documents                        |
| POST   | `/api/documents`               | Save a document                          |
| PATCH  | `/api/documents/{id}`          | Rename / favorite / update a document    |
| DELETE | `/api/documents/{id}`          | Delete a document                        |
| GET    | `/api/podcasts`                | List my podcasts (without heavy audio)   |
| GET    | `/api/podcasts/{id}`           | Get one podcast (`?include_audio=true`)  |
| POST   | `/api/podcasts`                | Save a podcast                           |
| PATCH  | `/api/podcasts/{id}`           | Favorite / rename a podcast              |
| DELETE | `/api/podcasts/{id}`           | Delete a podcast                         |
| POST   | `/api/podcast/generate`        | Generate + persist a podcast from a PDF  |
| GET    | `/api/health`                  | Health + database status                 |

**Example — signup:**
```bash
curl -X POST http://localhost:5173/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com", "password": "secret123"}'
```
```json
{
  "success": true,
  "token": "opaque-session-token",
  "tokenType": "bearer",
  "user": { "id": "…", "name": "Alice", "email": "alice@example.com", "createdAt": "…" }
}
```

**Example — generate a podcast:**
```bash
curl -X POST http://localhost:5173/api/podcast/generate \
  -H "Authorization: Bearer <token>" \
  -F "file=@my-document.pdf"
```
The response includes `saved: true` plus `saved_doc_id` / `saved_podcast_id` when the result was persisted to MongoDB.

---

## 📁 Project Structure

```
DocuCast-AI-PDF-to-Podcast-Generator/
├── README.md                ← you are here
├── package.json             ← frontend dependencies & scripts
├── vite.config.ts           ← dev server + /api proxy to backend
├── src/                     ← React frontend
│   ├── App.tsx              ← routing + session-restore splash
│   ├── state/AppContext.tsx ← global state (auth, library, player)
│   ├── services/api.ts      ← API client (auth, documents, podcasts, generate)
│   ├── screens/             ← pages (Auth, Dashboard, CreatePodcast, …)
│   └── components/          ← UI components (player, cards, layout, …)
├── public/
└── backend/                 ← FastAPI backend
    ├── requirements.txt
    ├── .env.example
    ├── app/
    │   ├── main.py          ← FastAPI app + lifespan (MongoDB connect)
    │   ├── config.py        ← settings from .env
    │   ├── db.py            ← MongoDB (Motor) connection + collections + indexes
    │   ├── security.py      ← bcrypt hashing + session tokens
    │   ├── schemas/         ← Pydantic models (auth, data, podcast)
    │   ├── api/
    │   │   ├── deps.py      ← auth dependency (Bearer token → user)
    │   │   └── routes/      ← auth, documents, podcasts, podcast/generate, health
    │   └── services/        ← pdf extraction, OCR, Groq script, TTS, FFmpeg
    └── tests/               ← 24 pytest tests (in-memory MongoDB)
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
| ------- | -------- |
| `MongoDB not reachable at mongodb://localhost:27017 — starting with an IN-MEMORY MongoDB emulator` | MongoDB isn't running. Start it (Docker/local/Atlas) and set `MONGODB_URI`. The emulator works for trying the app, but data won't survive a backend restart. |
| `Failed to connect to the backend` when signing up | Make sure the backend is running on port 8000 and the frontend on 5173. Check `http://localhost:8000/api/health`. |
| `503 AI_RATE_LIMIT` / `Groq` errors during generation | `GROQ_API_KEY` is missing or out of quota. Add it to `backend/.env` and restart the backend. |
| Scanned PDF fails with "does not contain extractable text" | Install Tesseract OCR (see Prerequisites). |
| `ffmpeg` errors during audio optimization | Install FFmpeg and make sure it's on your `PATH`. |
| Port 8000 or 5173 already in use | Change the port: backend `--port 8001` (and update `CORS_ORIGINS` + the Vite proxy target via `VITE_BACKEND_URL`), or frontend `npm run dev -- --port 5174`. |
| `pip install -r requirements.txt` fails | Use Python 3.11+; on Windows prefer the `py -3.11 -m venv .venv` variant. |
| I want the browser to call a deployed backend | Set `VITE_API_URL=https://your-backend.example.com` in a frontend `.env` file. |

---

## 🔒 Security Notes

- Passwords are **bcrypt-hashed** — plaintext is never stored or logged.
- Session tokens are random 48-byte values stored in MongoDB, validated per request, and **deleted on logout** so the token dies immediately.
- Sessions auto-expire via MongoDB TTL index (`expires_at`).
- Every documents/podcasts query is filtered by `user_id` — users cannot read or modify each other's data.
- `GROQ_API_KEY` lives only in `backend/.env`; it is never exposed to the frontend or in responses.

---

Made with ❤️ — happy podcasting! 🎧
