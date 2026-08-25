import os
import uuid
from pathlib import Path


def generate_safe_filename(original_filename: str = "upload.pdf") -> str:
    ext = Path(original_filename).suffix
    if not ext:
        ext = ".pdf"
    return f"{uuid.uuid4().hex}{ext}"


def ensure_dir(path: str) -> None:
    Path(path).mkdir(parents=True, exist_ok=True)
