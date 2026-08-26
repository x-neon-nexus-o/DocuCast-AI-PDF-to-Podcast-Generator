from pydantic import BaseModel, Field
from typing import List, Optional


class ChapterOut(BaseModel):
    id: str
    title: str
    startSec: int


class SummaryOut(BaseModel):
    overview: str = ""
    keyConcepts: List[str] = []
    takeaways: List[str] = []


class ScriptLineOut(BaseModel):
    id: str = ""
    speaker: str = "HOST"
    text: str = ""
    highlight: Optional[str] = None


class DocumentOut(BaseModel):
    id: str
    name: str
    type: str = "pdf"
    pages: int = 1
    status: str = "ready"
    date: str
    audioDurationSec: Optional[int] = None
    category: str = "Document"
    sizeMb: float = 0.0
    hasAudio: bool = False
    favorite: bool = False
    createdAt: Optional[str] = None


class DocumentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: str = "pdf"
    pages: int = 1
    status: str = "ready"
    date: Optional[str] = None
    audioDurationSec: Optional[int] = None
    category: str = "Document"
    sizeMb: float = 0.0
    hasAudio: bool = False
    favorite: bool = False


class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    favorite: Optional[bool] = None
    hasAudio: Optional[bool] = None


class PodcastOut(BaseModel):
    id: str
    docId: Optional[str] = None
    docName: Optional[str] = None
    title: str
    durationSec: float
    pages: int = 1
    language: str = "English"
    voice: str = "sarah"
    style: str = "conversational"
    category: str = "Document"
    date: str
    favorite: bool = False
    downloaded: bool = False
    coverAccent: str = "#3d96ff"
    chapters: List[ChapterOut] = Field(default_factory=list)
    summary: SummaryOut = Field(default_factory=SummaryOut)
    script: List[ScriptLineOut] = Field(default_factory=list)
    hasAudio: bool = False
    audioBase64: Optional[str] = None
    audioFormat: Optional[str] = "mp3"
    createdAt: Optional[str] = None


class PodcastCreate(BaseModel):
    docId: Optional[str] = None
    docName: Optional[str] = None
    title: str = Field(min_length=1, max_length=255)
    durationSec: float = 0
    pages: int = 1
    language: str = "English"
    voice: str = "sarah"
    style: str = "conversational"
    category: str = "Document"
    date: Optional[str] = None
    favorite: bool = False
    downloaded: bool = False
    coverAccent: str = "#3d96ff"
    chapters: List[ChapterOut] = []
    summary: SummaryOut = SummaryOut()
    script: List[ScriptLineOut] = []
    audioBase64: Optional[str] = None
    audioFormat: str = "mp3"


class PodcastUpdate(BaseModel):
    title: Optional[str] = None
    favorite: Optional[bool] = None
    downloaded: Optional[bool] = None
