"""Saved podcast CRUD — podcasts are persisted in the MongoDB `podcasts`
collection, scoped to the authenticated user. Audio is stored as base64 in
the document when it fits within MongoDB's 16 MB document limit; larger
audio files are flagged (hasAudio=False) so the generate response's audio
is still usable for immediate playback/download."""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app import db as db_module
from app.api.deps import get_current_user, get_db
from app.schemas.auth import UserOut
from app.schemas.data import PodcastCreate, PodcastOut, PodcastUpdate

logger = logging.getLogger(__name__)
router = APIRouter()

# Keep the BSON document well under the 16 MB limit (base64 overhead ~1.33x).
MAX_AUDIO_BASE64_CHARS = 12_000_000


def _pod_out(pod, include_audio: bool = False) -> PodcastOut:
    out = PodcastOut(
        id=str(pod["_id"]),
        docId=pod.get("docId"),
        docName=pod.get("docName"),
        title=pod.get("title", "Untitled"),
        durationSec=pod.get("durationSec", 0),
        pages=pod.get("pages", 1),
        language=pod.get("language", "English"),
        voice=pod.get("voice", "sarah"),
        style=pod.get("style", "conversational"),
        category=pod.get("category", "Document"),
        date=pod.get("date", ""),
        favorite=pod.get("favorite", False),
        downloaded=pod.get("downloaded", False),
        coverAccent=pod.get("coverAccent", "#3d96ff"),
        chapters=pod.get("chapters", []),
        summary=pod.get("summary", {"overview": "", "keyConcepts": [], "takeaways": []}),
        script=pod.get("script", []),
        hasAudio=pod.get("hasAudio", False),
        audioFormat=pod.get("audioFormat", "mp3"),
        createdAt=(
            pod["created_at"].strftime("%Y-%m-%d %H:%M:%S")
            if hasattr(pod.get("created_at"), "strftime")
            else None
        ),
    )
    if include_audio and pod.get("audioBase64"):
        out.audioBase64 = pod["audioBase64"]
    return out


@router.get("/podcasts", response_model=List[PodcastOut])
async def list_podcasts(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    user_id = db_module.to_object_id(user.id)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Invalid user id.")
    cursor = db[db_module.PODCASTS].find({"user_id": user_id}).sort("created_at", -1)
    pods = await cursor.to_list(length=500)
    return [_pod_out(p) for p in pods]


@router.get("/podcasts/{pod_id}", response_model=PodcastOut)
async def get_podcast(
    pod_id: str,
    include_audio: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    user_id = db_module.to_object_id(user.id)
    oid = db_module.to_object_id(pod_id)
    if user_id is None or oid is None:
        raise HTTPException(status_code=404, detail="Podcast not found.")
    pod = await db[db_module.PODCASTS].find_one({"_id": oid, "user_id": user_id})
    if pod is None:
        raise HTTPException(status_code=404, detail="Podcast not found.")
    return _pod_out(pod, include_audio=include_audio)


@router.post("/podcasts", response_model=PodcastOut, status_code=status.HTTP_201_CREATED)
async def save_podcast(
    payload: PodcastCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    user_id = db_module.to_object_id(user.id)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Invalid user id.")

    now = db_module.utcnow()
    doc = payload.model_dump(exclude={"audioBase64"})
    doc["date"] = payload.date or db_module.iso_date(now)
    doc["user_id"] = user_id
    doc["created_at"] = now
    doc["hasAudio"] = False
    doc["audioBase64"] = None

    audio_b64 = payload.audioBase64 or ""
    if audio_b64:
        if len(audio_b64) <= MAX_AUDIO_BASE64_CHARS:
            doc["audioBase64"] = audio_b64
            doc["hasAudio"] = True
        else:
            logger.warning(
                "Audio for podcast '%s' exceeds %d base64 chars — storing metadata only.",
                payload.title,
                MAX_AUDIO_BASE64_CHARS,
            )

    result = await db[db_module.PODCASTS].insert_one(doc)
    doc["_id"] = result.inserted_id
    logger.info("Podcast saved to MongoDB: %s (user=%s)", doc["title"], user.email)
    return _pod_out(doc, include_audio=True)


@router.patch("/podcasts/{pod_id}", response_model=PodcastOut)
async def update_podcast(
    pod_id: str,
    payload: PodcastUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    user_id = db_module.to_object_id(user.id)
    oid = db_module.to_object_id(pod_id)
    if user_id is None or oid is None:
        raise HTTPException(status_code=404, detail="Podcast not found.")

    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update.")

    result = await db[db_module.PODCASTS].find_one_and_update(
        {"_id": oid, "user_id": user_id},
        {"$set": update},
        return_document=True,  # type: ignore[arg-type]
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Podcast not found.")
    return _pod_out(result)


@router.delete("/podcasts/{pod_id}", response_model=dict)
async def delete_podcast(
    pod_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    user_id = db_module.to_object_id(user.id)
    oid = db_module.to_object_id(pod_id)
    if user_id is None or oid is None:
        raise HTTPException(status_code=404, detail="Podcast not found.")

    result = await db[db_module.PODCASTS].delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Podcast not found.")
    return {"success": True, "deleted": pod_id}
