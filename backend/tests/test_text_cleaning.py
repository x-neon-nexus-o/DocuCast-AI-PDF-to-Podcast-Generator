import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.pdf_service import clean_extracted_text


def test_text_cleaning():
    dirty = "Hello   world!!\n\n\n\n  Multiple   spaces   here  \n\n\nAnother line."
    cleaned = clean_extracted_text(dirty)
    assert "  " not in cleaned
    assert "\n\n\n" not in cleaned
    assert "Hello world!!" in cleaned or "Hello world" in cleaned
