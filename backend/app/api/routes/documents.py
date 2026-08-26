"""Document metadata CRUD — every document belongs to the authenticated user
and is persisted in the MongoDB `documents` collection."""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app import db as db_module
from app.api.deps import get_current_user, get_db
from app.schemas.auth import UserOut
from app.schemas.data import DocumentCreate, DocumentOut, DocumentUpdate

logger = logging.getLogger(__name__)
router = APIRouter()


def _doc_out(doc) -> DocumentOut:
    return DocumentOut(
        id=str(doc["_id"]),
        name=doc.get("name", ""),
        type=doc.get("type", "pdf"),
        pages=doc.get("pages", 1),
        status=doc.get("status", "ready"),
        date=doc.get("date", ""),
        audioDurationSec=doc.get("audioDurationSec"),
        category=doc.get("category", "Document"),
        sizeMb=doc.get("sizeMb", 0.0),
        hasAudio=doc.get("hasAudio", False),
        favorite=doc.get("favorite", False),
        createdAt=(
            doc["created_at"].strftime("%Y-%m-%d %H:%M:%S")
            if hasattr(doc.get("created_at"), "strftime")
            else None
        ),
    )


@router.get("/documents", response_model=List[DocumentOut])
async def list_documents(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    user_id = db_module.to_object_id(user.id)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Invalid user id.")
    cursor = db[db_module.DOCUMENTS].find({"user_id": user_id}).sort("created_at", -1)
    docs = await cursor.to_list(length=500)
    return [_doc_out(d) for d in docs]


@router.post("/documents", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    user_id = db_module.to_object_id(user.id)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Invalid user id.")

    now = db_module.utcnow()
    doc = payload.model_dump()
    doc["date"] = payload.date or db_module.iso_date(now)
    doc["user_id"] = user_id
    doc["created_at"] = now
    result = await db[db_module.DOCUMENTS].insert_one(doc)
    doc["_id"] = result.inserted_id
    logger.info("Document saved to MongoDB: %s (user=%s)", doc["name"], user.email)
    return _doc_out(doc)


@router.patch("/documents/{doc_id}", response_model=DocumentOut)
async def update_document(
    doc_id: str,
    payload: DocumentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    user_id = db_module.to_object_id(user.id)
    oid = db_module.to_object_id(doc_id)
    if user_id is None or oid is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update.")

    result = await db[db_module.DOCUMENTS].find_one_and_update(
        {"_id": oid, "user_id": user_id},
        {"$set": update},
        return_document=True,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    return _doc_out(result)


@router.delete("/documents/{doc_id}", response_model=dict)
async def delete_document(
    doc_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    user_id = db_module.to_object_id(user.id)
    oid = db_module.to_object_id(doc_id)
    if user_id is None or oid is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    result = await db[db_module.DOCUMENTS].delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"success": True, "deleted": doc_id}
