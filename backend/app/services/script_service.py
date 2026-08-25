import logging
from typing import Optional
from app.services.groq_service import generate_script_from_text, GroqServiceError

logger = logging.getLogger(__name__)


class ScriptServiceError(Exception):
    pass


def generate_podcast_script(cleaned_text: str, model: Optional[str] = None) -> str:
    if not cleaned_text or len(cleaned_text.strip()) < 20:
        raise ScriptServiceError("Text is too short to generate a podcast script.")

    try:
        script = generate_script_from_text(cleaned_text, model=model)
    except GroqServiceError:
        raise
    except Exception as exc:
        logger.error("Unexpected script generation error: %s", exc)
        raise ScriptServiceError(f"Failed to generate podcast script: {exc}")

    # Validate that script contains speaker markers and is non-empty
    script_stripped = script.strip()
    if not script_stripped:
        raise ScriptServiceError("The AI service returned an empty script.")

    # Basic validation for HOST / EXPERT markers
    if "HOST" not in script_stripped and "EXPERT" not in script_stripped:
        # Some scripts may use different labels; don't reject too strictly
        # but log a warning
        logger.info("Script does not contain HOST/EXPERT markers; using free-form script.")

    logger.info("Podcast script generated (%d chars)", len(script_stripped))
    return script_stripped
