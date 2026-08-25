import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from unittest.mock import patch, MagicMock
from app.services.groq_service import generate_script_from_text, build_podcast_prompt, GroqServiceError


def test_build_prompt_contains_requirement():
    prompt = build_podcast_prompt("Some text")
    assert "Use ONLY information contained" in prompt
    assert "podcast" in prompt.lower()


@patch("app.services.groq_service.get_client")
def test_generate_script_success(mock_get_client):
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    mock_completion = MagicMock()
    mock_completion.choices = [MagicMock()]
    mock_completion.choices[0].message.content = "HOST: Welcome. EXPERT: Today we discuss AI."
    mock_client.chat.completions.create.return_value = mock_completion

    result = generate_script_from_text("This document explains machine learning.")
    assert "HOST" in result or "Welcome" in result
    mock_client.chat.completions.create.assert_called_once()


@patch("app.services.groq_service.get_client")
def test_groq_rate_limit_raises(mock_get_client):
    from groq import RateLimitError
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client
    mock_client.chat.completions.create.side_effect = RateLimitError("rate limited", response=MagicMock(), body=MagicMock())

    with pytest.raises(GroqServiceError) as exc_info:
        generate_script_from_text("Some text")
    assert "AI_RATE_LIMIT" in str(exc_info.value.code) or "busy" in str(exc_info.value.message).lower()
