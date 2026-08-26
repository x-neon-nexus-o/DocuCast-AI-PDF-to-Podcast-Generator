import logging
import time
import base64
import re
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app import db as db_module
from app.api.deps import get_current_user, get_db
from app.schemas.auth import UserOut
from app.schemas.podcast import PodcastGenerateResponse
from app.utils.file_utils import generate_safe_filename, ensure_dir
from app.utils.cleanup import safe_remove
from app.services.pdf_service import extract_text_from_pdf, PDFServiceError
from app.services.script_service import generate_podcast_script, ScriptServiceError
from app.services.groq_service import GroqServiceError
from app.services.tts_service import synthesize_text_to_audio, TTSServiceError
from app.services.audio_service import optimize_audio, AudioServiceError

logger = logging.getLogger(__name__)
router = APIRouter()

_SCRIPT_LINE_RE = re.compile(r"^(HOST|EXPERT)[:\s]*(.+)$")


def _script_lines(script: str) -> list:
    """Parse a generated script into {id, speaker, text} lines."""
    lines = []
    for i, raw in enumerate([l for l in script.split("\n") if l.strip()]):
        match = _SCRIPT_LINE_RE.match(raw)
        if match:
            lines.append(
                {"id": f"line-{i}", "speaker": match.group(1), "text": match.group(2).strip()}
            )
        else:
            lines.append({"id": f"line-{i}", "speaker": "HOST", "text": raw.strip()})
    return lines


async def _persist_generation(
    db: AsyncIOMotorDatabase,
    user: UserOut,
    *,
    filename: str,
    script: str,
    audio_base64: str,
    audio_format: str,
    pages_processed: int,
    audio_duration: float,
):
    """Persist the generated document + podcast into MongoDB.

    Returns (doc_id, podcast_id). Raises on DB failure so the caller can
    surface a 'saved: false' flag while still returning the audio.
    """
    from app.schemas.data import DocumentCreate, PodcastCreate

    user_id = db_module.to_object_id(user.id)
    now = db_module.utcnow()

    size_mb = 0.0
    try:
        # Audio base64 length -> approx binary size
        size_mb = round((len(audio_base64) * 3 / 4) / (1024 * 1024), 2)
    except Exception:
        pass

    doc_payload = DocumentCreate(
        name=filename,
        type="pdf",
        pages=pages_processed,
        status="ready",
        date=db_module.iso_date(now),
        audioDurationSec=int(audio_duration) if audio_duration else None,
        category="Document",
        sizeMb=size_mb,
        hasAudio=True,
        favorite=False,
    )
    doc_result = await db[db_module.DOCUMENTS].insert_one(
        {
            **doc_payload.model_dump(),
            "user_id": user_id,
            "created_at": now,
        }
    )
    doc_id = doc_result.inserted_id

    title = Path(filename).stem.replace("_", " ").replace("-", " ")
    pod_payload = PodcastCreate(
        docId=str(doc_id),
        docName=filename,
        title=title,
        durationSec=audio_duration or 0,
        pages=pages_processed,
        language="English",
        voice="sarah",
        style="conversational",
        category="Document",
        date=db_module.iso_date(now),
        favorite=False,
        downloaded=False,
        coverAccent="#3d96ff",
        chapters=[
            {"id": "c1", "title": "Introduction", "startSec": 0},
            {"id": "c2", "title": "Main Discussion", "startSec": int((audio_duration or 0) / 3)},
            {"id": "c3", "title": "Takeaways", "startSec": int((audio_duration or 0) * 2 / 3)},
        ],
        summary={
            "overview": (script[:300] + "..." if len(script) > 300 else script),
            "keyConcepts": ["Document content", "Key insights from text"],
            "takeaways": ["Review the generated audio for full details"],
        },
        script=_script_lines(script),
        audioBase64=audio_base64,
        audioFormat=audio_format,
    )
    pod_result = await db[db_module.PODCASTS].insert_one(
        {
            **pod_payload.model_dump(exclude={"audioBase64"}),
            "user_id": user_id,
            "created_at": now,
            "hasAudio": True,
            "audioBase64": audio_base64,
        }
    )

    logger.info(
        "Generation persisted to MongoDB: doc=%s podcast=%s (user=%s)",
        doc_id,
        pod_result.inserted_id,
        user.email,
    )
    return str(doc_id), str(pod_result.inserted_id)


@router.post("/podcast/generate", response_model=PodcastGenerateResponse)
async def generate_podcast(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    start_time = time.time()
    temp_pdf_path: Optional[str] = None
    temp_audio_path: Optional[str] = None
    temp_optimized_path: Optional[str] = None

    try:
        # Validate file presence
        if not file or not file.filename:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {"code": "NO_FILE", "message": "No file was uploaded."},
                },
            )

        # Validate extension
        original_name = file.filename
        ext = Path(original_name).suffix.lower()
        if ext != ".pdf":
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {"code": "INVALID_EXTENSION", "message": "Only PDF files are supported."},
                },
            )

        # Validate MIME type loosely
        content_type = file.content_type or ""
        if content_type and "pdf" not in content_type and content_type != "application/octet-stream":
            # Not a strict blocker for MVP
            logger.info("Content type: %s", content_type)

        # Read content and check size
        contents = await file.read()
        file_size = len(contents)
        if file_size == 0:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {"code": "EMPTY_FILE", "message": "The uploaded file is empty."},
                },
            )

        max_bytes = settings.MAX_FILE_SIZE_BYTES
        if file_size > max_bytes:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "success": False,
                    "error": {
                        "code": "FILE_TOO_LARGE",
                        "message": f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB} MB.",
                    },
                },
            )

        # Save to temp with safe name
        ensure_dir("backend/temp")
        safe_name = generate_safe_filename(original_name)
        temp_pdf_path = f"backend/temp/{safe_name}"
        with open(temp_pdf_path, "wb") as f:
            f.write(contents)

        logger.info("PDF saved temporarily: %s (%d bytes)", temp_pdf_path, file_size)

        # Extract text
        try:
            cleaned_text, pages_processed, total_pages = extract_text_from_pdf(
                temp_pdf_path, max_pages=settings.MAX_PAGES
            )
        except PDFServiceError as exc:
            logger.warning("PDF extraction failed: %s", exc)
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "success": False,
                    "error": {"code": "PDF_EXTRACTION_ERROR", "message": str(exc)},
                },
            )

        # Generate script
        try:
            script = generate_podcast_script(cleaned_text)
        except GroqServiceError as exc:
            logger.error("Groq error: %s", exc)
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "success": False,
                    "error": {"code": exc.code, "message": exc.message},
                },
            )
        except ScriptServiceError as exc:
            logger.error("Script error: %s", exc)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "error": {"code": "SCRIPT_ERROR", "message": str(exc)},
                },
            )

        # TTS Synthesis (run async via asyncio.run or event loop)
        try:
            temp_audio_path = await synthesize_text_to_audio(
                script,
                voice_id="sarah",
            )
        except TTSServiceError as exc:
            logger.error("TTS error: %s", exc)
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "success": False,
                    "error": {"code": "TTS_ERROR", "message": str(exc)},
                },
            )

        # Optimize with FFmpeg
        try:
            temp_optimized_path = optimize_audio(
                temp_audio_path,
                bitrate=settings.AUDIO_BITRATE,
                channels=settings.AUDIO_CHANNELS,
            )
        except AudioServiceError as exc:
            logger.error("Audio optimization error: %s", exc)
            # Fallback to unoptimized audio
            temp_optimized_path = temp_audio_path

        # Read optimized audio and base64 encode
        with open(temp_optimized_path, "rb") as f:
            audio_binary = f.read()
        audio_base64 = base64.b64encode(audio_binary).decode("utf-8")

        processing_time = time.time() - start_time
        audio_duration_approx = max(30, len(script) / 15)  # rough estimate

        logger.info("Pipeline complete in %.2f seconds", processing_time)

        # Persist the generated document + podcast into MongoDB (user-scoped).
        saved = False
        saved_doc_id = None
        saved_podcast_id = None
        try:
            saved_doc_id, saved_podcast_id = await _persist_generation(
                db,
                user,
                filename=original_name,
                script=script,
                audio_base64=audio_base64,
                audio_format="mp3",
                pages_processed=pages_processed,
                audio_duration=round(audio_duration_approx, 1),
            )
            saved = True
        except Exception as exc:  # noqa: BLE001 - never let storage failure break the response
            logger.error("Failed to persist generation to MongoDB: %s", exc)

        return PodcastGenerateResponse(
            success=True,
            filename=original_name,
            script=script,
            audio=audio_base64,
            audio_format="mp3",
            pages_processed=pages_processed,
            processing_time=round(processing_time, 2),
            audio_duration=round(audio_duration_approx, 1),
            model_used=settings.GROQ_MODEL,
            saved=saved,
            saved_doc_id=saved_doc_id,
            saved_podcast_id=saved_podcast_id,
        )

    finally:
        # Cleanup temporary files
        if temp_pdf_path:
            safe_remove(temp_pdf_path)
        # Keep intermediate audio temporarily but remove after response generation
        if temp_audio_path and temp_audio_path != temp_optimized_path:
            safe_remove(temp_audio_path)
        # Note: optimized audio is kept briefly in memory (base64); file can be removed
        if temp_optimized_path:
            safe_remove(temp_optimized_path)
