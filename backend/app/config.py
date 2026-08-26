import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)


class Settings:
    # --- DocuCast pipeline ---
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama3-8b-8192")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    MAX_PAGES: int = int(os.getenv("MAX_PAGES", "10"))
    AUDIO_BITRATE: str = os.getenv("AUDIO_BITRATE", "64k")
    AUDIO_CHANNELS: int = int(os.getenv("AUDIO_CHANNELS", "1"))
    MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_MB * 1024 * 1024
    CORS_ORIGINS: list = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if o.strip()
    ]
    APP_VERSION: str = "1.1.0"
    API_PREFIX: str = "/api"

    # --- MongoDB ---
    # When MONGODB_URI is not explicitly configured, the backend first tries
    # mongodb://localhost:27017 and, if unreachable, falls back to an in-memory
    # MongoDB emulator so local development still works. Data only persists
    # when a real MongoDB (local or Atlas) is configured.
    MONGODB_URI: str = os.getenv("MONGODB_URI", "").strip()
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "docucast").strip()
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: int = int(
        os.getenv("MONGODB_SERVER_SELECTION_TIMEOUT_MS", "2500")
    )
    MONGODB_CONNECT_TIMEOUT_MS: int = int(os.getenv("MONGODB_CONNECT_TIMEOUT_MS", "2500"))

    # --- Sessions ---
    # How long a session lives in MongoDB. "Remember me" sessions get
    # SESSION_REMEMBER_DAYS; default sessions get SESSION_DEFAULT_DAYS.
    SESSION_REMEMBER_DAYS: int = int(os.getenv("SESSION_REMEMBER_DAYS", "30"))
    SESSION_DEFAULT_DAYS: int = int(os.getenv("SESSION_DEFAULT_DAYS", "1"))

    @property
    def mongodb_uri(self) -> str:
        """Effective MongoDB connection string."""
        return self.MONGODB_URI or "mongodb://localhost:27017"

    @property
    def mongodb_uri_explicit(self) -> bool:
        """True when the user explicitly configured MONGODB_URI."""
        return bool(self.MONGODB_URI)


settings = Settings()
