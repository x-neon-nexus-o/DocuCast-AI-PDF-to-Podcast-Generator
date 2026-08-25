import asyncio
import logging
import tempfile
import os
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import edge_tts
except ImportError:
    edge_tts = None
    logger.warning("edge-tts import failed; ensure it is installed.")


class TTSServiceError(Exception):
    pass


VOICE_MAP = {
    "sarah": "en-US-AriaNeural",
    "david": "en-US-GuyNeural",
    "alex": "en-US-TonyNeural",
    "emma": "en-US-JennyNeural",
}


def get_voice_for_config(voice_id: str) -> str:
    return VOICE_MAP.get(voice_id, "en-US-AriaNeural")


async def synthesize_text_to_audio(
    text: str,
    output_path: Optional[str] = None,
    voice_id: str = "sarah",
    rate: str = "+0%",
) -> str:
    if edge_tts is None:
        raise TTSServiceError("edge-tts is not installed.")

    if not text or len(text.strip()) < 5:
        raise TTSServiceError("Text is too short for speech synthesis.")

    voice = get_voice_for_config(voice_id)
    # Truncate very long text for TTS to avoid errors
    max_tts_chars = 3000
    text_for_tts = text[:max_tts_chars]

    output_file = output_path or tempfile.mktemp(suffix=".mp3", prefix="tts_")
    # Ensure directory exists
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)

    try:
        communicate = edge_tts.Communicate(text_for_tts, voice)
        await communicate.save(output_file)
        logger.info("TTS audio saved to %s", output_file)
        return str(output_file)
    except Exception as exc:
        logger.error("TTS synthesis failed: %s", exc)
        raise TTSServiceError(f"Speech synthesis failed: {exc}")
