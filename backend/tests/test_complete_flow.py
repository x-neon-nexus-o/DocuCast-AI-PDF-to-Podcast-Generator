import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from unittest.mock import patch, AsyncMock
import tempfile
import PyPDF2

def test_complete_pipeline_mocked():
    from fastapi.testclient import TestClient
    from app.main import app

    # Create a real temporary PDF file
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        writer = PyPDF2.PdfWriter()
        writer.add_blank_page(width=612, height=792)
        writer.write(tmp)
        tmp_path = tmp.name

    import asyncio
    audio_path = None
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as audio_tmp:
        audio_tmp.write(b"fake audio content")
        audio_path = audio_tmp.name

    with patch("app.api.routes.podcast.extract_text_from_pdf") as mock_extract, \
         patch("app.api.routes.podcast.generate_podcast_script") as mock_script, \
         patch("app.api.routes.podcast.synthesize_text_to_audio", new_callable=AsyncMock) as mock_tts, \
         patch("app.api.routes.podcast.optimize_audio") as mock_optimize:

        mock_extract.return_value = ("This document explains AI concepts.", 1, 1)
        mock_script.return_value = "HOST: Welcome. EXPERT: AI is amazing."
        mock_tts.return_value = audio_path
        mock_optimize.return_value = audio_path

        client = TestClient(app)
        with open(tmp_path, "rb") as f:
            response = client.post(
                "/api/podcast/generate",
                files={"file": ("test.pdf", f, "application/pdf")},
            )

        # Since our mocks replace everything, it should return 200
        assert response.status_code == 200, f"Status: {response.status_code} Body: {response.text}"
