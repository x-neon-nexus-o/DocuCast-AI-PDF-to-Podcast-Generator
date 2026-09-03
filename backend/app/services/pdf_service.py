import PyPDF2
import logging
from pathlib import Path
from typing import Tuple, Optional, List

logger = logging.getLogger(__name__)

# Optional OCR imports — available when pytesseract, pdf2image, and Pillow are installed
try:
    import pytesseract
    from pdf2image import convert_from_path
    from PIL import Image
    OCR_AVAILABLE = True
    logger.info("OCR libraries (pytesseract, pdf2image, Pillow) loaded successfully.")
except Exception as exc:
    OCR_AVAILABLE = False
    logger.warning("OCR libraries not fully available (%s). OCR fallback disabled.", exc)


class PDFServiceError(Exception):
    pass


def clean_extracted_text(text: str) -> str:
    lines = text.splitlines()
    cleaned_lines: list[str] = []
    for line in lines:
        line = line.strip()
        cleaned_lines.append(line)
    combined = "\n".join(cleaned_lines)
    while "\n\n\n" in combined:
        combined = combined.replace("\n\n\n", "\n\n")
    while "  " in combined:
        combined = combined.replace("  ", " ")
    return combined.strip()


def _extract_text_with_py_pdf(file_path: str, max_pages: int = 10) -> Tuple[List[str], int, int]:
    reader = PyPDF2.PdfReader(str(file_path))
    total_pages = len(reader.pages)
    pages_to_read = min(max_pages, total_pages)
    extracted_pages: list[str] = []
    for i in range(pages_to_read):
        try:
            page_text = reader.pages[i].extract_text()
            if page_text is not None:
                extracted_pages.append(page_text)
        except Exception as exc:
            logger.warning("Failed to extract text from page %d: %s", i + 1, exc)
            continue
    return extracted_pages, total_pages, pages_to_read


def _extract_text_with_ocr(file_path: str, max_pages: int = 10) -> Tuple[List[str], int, int]:
    """
    Use Tesseract OCR on PDF pages converted to images via pdf2image.
    Returns (extracted_text_per_page, total_pages, pages_processed).
    """
    if not OCR_AVAILABLE:
        raise PDFServiceError(
            "OCR is not available. Please install tesseract-ocr system package, "
            "and ensure pytesseract, pdf2image, and Pillow are installed."
        )

    try:
        # Convert only the first max_pages to images at 200 DPI for good OCR quality
        images = convert_from_path(file_path, first_page=1, last_page=max_pages, dpi=200)
    except Exception as exc:
        logger.error("Failed to convert PDF pages to images for OCR: %s", exc)
        raise PDFServiceError(f"Failed to prepare PDF for OCR: {exc}")

    total_pages = len(images)
    pages_processed = min(max_pages, total_pages)
    extracted_pages: list[str] = []

    for idx, image in enumerate(images):
        if idx >= max_pages:
            break
        try:
            # Convert PIL image to text using Tesseract
            # Configure Tesseract to preserve spaces and treat as single text block
            text = pytesseract.image_to_string(image, config="--psm 6")
            if text is not None:
                extracted_pages.append(text)
            logger.info("OCR completed for page %d (%d chars)", idx + 1, len(text or ""))
        except Exception as exc:
            logger.warning("OCR failed for page %d: %s", idx + 1, exc)
            # Continue with empty text for this page rather than failing entirely
            extracted_pages.append("")
            continue

    return extracted_pages, total_pages, pages_processed


def extract_text_from_pdf(file_path: str, max_pages: int = 10) -> Tuple[str, int, int]:
    """
    Extract text from a PDF file.
    First attempts PyPDF2 text extraction; if that yields little/no text,
    falls back to Tesseract OCR for scanned/image-only PDFs.

    Returns:
        (cleaned_text, pages_processed, total_pages)
    Raises:
        PDFServiceError: on invalid PDF, empty extraction, missing text layer,
        or if OCR is unavailable and text extraction fails.
    """
    path = Path(file_path)
    if not path.exists():
        raise PDFServiceError(f"File not found: {file_path}")

    # Try standard text extraction first
    try:
        extracted_pages, total_pages, pages_read = _extract_text_with_py_pdf(file_path, max_pages)
    except Exception as exc:
        logger.error("Failed to open/read PDF: %s", exc)
        raise PDFServiceError("The uploaded file is not a valid PDF or is corrupted.")

    combined_text = "\n\n".join(extracted_pages)
    cleaned_text = clean_extracted_text(combined_text)

    # If text extraction produced meaningful content, return it
    if cleaned_text and len(cleaned_text.strip()) >= 10:
        logger.info("PDF text extracted via PyPDF2: %d/%d pages, %d chars", pages_read, total_pages, len(cleaned_text))
        return cleaned_text, pages_read, total_pages

    # Otherwise, attempt OCR fallback for scanned/image PDFs
    logger.info("Standard extraction insufficient (%d chars). Attempting Tesseract OCR...", len(cleaned_text.strip()))
    try:
        ocr_pages, ocr_total, ocr_read = _extract_text_with_ocr(file_path, max_pages)
    except PDFServiceError:
        # Re-raise if OCR explicitly unavailable or fails
        raise PDFServiceError(
            "This document does not contain extractable text. "
            "It may be a scanned/image-only PDF. "
            "Please install tesseract-ocr (system package) and ensure pytesseract, pdf2image, and Pillow are installed for OCR support. "
            "Refer to README.md for detailed installation instructions."
        )
    except Exception as exc:
        logger.error("Unexpected OCR error: %s", exc)
        raise PDFServiceError(
            "This document does not contain extractable text, and OCR processing failed. "
            "Please ensure tesseract-ocr is installed and the PDF is valid."
        )

    ocr_combined = "\n\n".join(ocr_pages)
    ocr_cleaned = clean_extracted_text(ocr_combined)

    if not ocr_cleaned or len(ocr_cleaned.strip()) < 10:
        raise PDFServiceError(
            "This document does not contain extractable text via standard extraction or OCR. "
            "It may be a scanned/image-only PDF without recognizable text, or the image quality is too low."
        )

    logger.info("PDF text extracted via Tesseract OCR: %d/%d pages, %d chars", ocr_read, ocr_total, len(ocr_cleaned))
    return ocr_cleaned, ocr_read, ocr_total
