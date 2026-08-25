import logging
import time
import base64
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse

from app.config import settings
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


@router.post("/podcast/generate", response_model=PodcastGenerateResponse)
async def generate_podcast(
    file: UploadFile = File(...),
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
