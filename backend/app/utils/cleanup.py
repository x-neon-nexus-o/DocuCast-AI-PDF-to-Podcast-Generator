import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def safe_remove(path: str) -> None:
    try:
        p = Path(path)
        if p.exists():
            p.unlink()
            logger.debug("Removed file: %s", path)
    except Exception as exc:
        logger.warning("Failed to remove file %s: %s", path, exc)


def clean_temp_directory(temp_dir: str = "temp") -> None:
    temp_path = Path(temp_dir)
    if not temp_path.exists():
        return
    for item in temp_path.iterdir():
        try:
            if item.is_file():
                item.unlink()
            elif item.is_dir():
                # Skip — only clean files for MVP
                pass
        except Exception as exc:
            logger.warning("Failed to clean temp item %s: %s", item, exc)
