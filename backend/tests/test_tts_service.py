import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from app.services.tts_service import synthesize_text_to_audio, TTSServiceError, VOICE_MAP


def test_voice_map():
    assert "en-US-AriaNeural" in VOICE_MAP.values()


@pytest.mark.asyncio
@patch("app.services.tts_service.edge_tts")
async def test_tts_synthesis(mock_edge_tts):
    mock_communicate = AsyncMock()
    mock_communicate.save = AsyncMock()
    mock_edge_tts.Communicate.return_value = mock_communicate

    with open("/dev/null", "w") as f:
        pass  # Just to have a temp file reference

    # We call with a temp output path
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        output_path = tmp.name

    result = await synthesize_text_to_audio(
        "Hello world", output_path=output_path, voice_id="sarah"
    )
    assert result == output_path
    mock_edge_tts.Communicate.assert_called_once()
