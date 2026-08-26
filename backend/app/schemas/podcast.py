from pydantic import BaseModel, Field
from typing import Optional, List


class PodcastGenerateRequest(BaseModel):
    pass  # file upload handled separately


class ErrorDetail(BaseModel):
    code: str
    message: str


class PodcastGenerateResponse(BaseModel):
    success: bool = True
    filename: Optional[str] = None
    script: Optional[str] = None
    audio: Optional[str] = None  # Base64-encoded MP3
    audio_format: Optional[str] = "mp3"
    pages_processed: Optional[int] = None
    processing_time: Optional[float] = None
    audio_duration: Optional[float] = None
    model_used: Optional[str] = None
    saved: Optional[bool] = None  # Whether the result was persisted to MongoDB
    saved_doc_id: Optional[str] = None
    saved_podcast_id: Optional[str] = None
    error: Optional[ErrorDetail] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    message: str
    database: Optional[dict] = None
