"""Shared FastAPI dependencies (authentication)."""

import logging
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app import db as db_module
from app.schemas.auth import UserOut

logger = logging.getLogger(__name__)


def get_db() -> AsyncIOMotorDatabase:
    return db_module.get_database()


async def get_current_user(
    db: AsyncIOMotorDatabase = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
) -> UserOut:
    """Resolve the authenticated user from the `Authorization: Bearer <token>`
    header, using the MongoDB `sessions` collection."""
    token = _extract_bearer(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_REQUIRED",
                "message": "You must be signed in to perform this action.",
            },
        )

    session = await db[db_module.SESSIONS].find_one({"token": token})
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_SESSION", "message": "Session is invalid or expired. Please sign in again."},
        )

    expires_at = session.get("expires_at")
    if expires_at is not None and expires_at < db_module.utcnow():
        await db[db_module.SESSIONS].delete_one({"_id": session["_id"]})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "SESSION_EXPIRED", "message": "Session expired. Please sign in again."},
        )

    user_id = session.get("user_id")
    user = await db[db_module.USERS].find_one({"_id": user_id}) if user_id is not None else None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "USER_NOT_FOUND", "message": "Account no longer exists."},
        )

    created = user.get("created_at")
    created_str = (
        created.strftime("%Y-%m-%d %H:%M:%S")
        if hasattr(created, "strftime")
        else str(created or "")
    )
    return UserOut(
        id=str(user["_id"]),
        name=user.get("name", ""),
        email=user.get("email", ""),
        createdAt=created_str,
    )


def _extract_bearer(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip() or None
