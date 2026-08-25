import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)


class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama3-8b-8192")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    MAX_PAGES: int = int(os.getenv("MAX_PAGES", "10"))
    AUDIO_BITRATE: str = os.getenv("AUDIO_BITRATE", "64k")
    AUDIO_CHANNELS: int = int(os.getenv("AUDIO_CHANNELS", "1"))
    MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_MB * 1024 * 1024
    CORS_ORIGINS: list = ["http://localhost:5173"]
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"


settings = Settings()
