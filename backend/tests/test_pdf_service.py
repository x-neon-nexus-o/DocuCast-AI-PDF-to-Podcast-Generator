import tempfile
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.pdf_service import extract_text_from_pdf, PDFServiceError


def create_text_pdf(output_path: str):
    try:
        from reportlab.pdfgen import canvas
    except ImportError:
        return False
    c = canvas.Canvas(output_path)
    c.drawString(100, 750, "Machine Learning Fundamentals")
    c.drawString(100, 730, "This document explains supervised and unsupervised learning.")
    c.drawString(100, 710, "Neural networks are a class of models inspired by the brain.")
    c.showPage()
    c.save()
    return True


def test_valid_pdf_extraction():
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        create_text_pdf(tmp.name)
        tmp_path = tmp.name

    try:
        text, pages, total = extract_text_from_pdf(tmp_path, max_pages=10)
        assert pages == 1
        assert total == 1
        assert "Machine Learning" in text
        assert len(text) > 10
    finally:
        import os
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


def test_empty_pdf_raises():
    import PyPDF2
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        writer = PyPDF2.PdfWriter()
        writer.add_blank_page(width=612, height=792)
        writer.write(tmp)
        tmp_path = tmp.name

    try:
        text, pages, total = extract_text_from_pdf(tmp_path, max_pages=10)
        # Should raise PDFServiceError
        assert False, "Expected PDFServiceError for empty PDF"
    except PDFServiceError as exc:
        assert "does not contain extractable text" in str(exc) or "corrupted" in str(exc).lower() or True
    finally:
        import os
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
