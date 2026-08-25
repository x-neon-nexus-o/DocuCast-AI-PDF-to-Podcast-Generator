from typing import Optional
import subprocess
import logging
import os
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


class AudioServiceError(Exception):
    pass


def optimize_audio(
    input_path: str,
    output_path: Optional[str] = None,
    bitrate: str = "64k",
    channels: int = 1,
    format_ext: str = "mp3",
) -> str:
    try:
        import subprocess
    except ImportError:
        raise AudioServiceError("subprocess is unavailable.")

    if not Path(input_path).exists():
        raise AudioServiceError(f"Input audio file not found: {input_path}")

    output_file = output_path or tempfile.mktemp(suffix=f".{format_ext}", prefix="opt_")
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-i", input_path,
        "-ac", str(channels),
        "-b:a", bitrate,
        "-ar", "22050",
        "-y",
        output_file,
    ]

    logger.info("Running FFmpeg: %s", " ".join(cmd))
    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
        )
        logger.info("FFmpeg completed successfully.")
    except FileNotFoundError:
        logger.error("FFmpeg not found in PATH.")
        raise AudioServiceError("FFmpeg is not installed or not in the system PATH.")
    except subprocess.CalledProcessError as exc:
        stderr_msg = exc.stderr.decode("utf-8", errors="replace") if exc.stderr else ""
        logger.error("FFmpeg error: %s", stderr_msg)
        raise AudioServiceError(f"Audio optimization failed: {stderr_msg}")

    return str(output_file)
