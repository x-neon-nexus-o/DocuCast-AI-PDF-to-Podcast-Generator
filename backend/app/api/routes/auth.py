"""Authentication endpoints backed by MongoDB.

- POST /auth/signup   : create account + start session
- POST /auth/login    : verify credentials + start session
- POST /auth/logout   : destroy session (removes the token from MongoDB)
- GET  /auth/me       : return the current session's user
- POST /auth/change-password : update the account password (all other
                               sessions for the user are invalidated)
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app import db as db_module
from app.api.deps import get_current_user, get_db
from app.schemas.auth import (
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    MessageResponse,
    SignupRequest,
    UserOut,
)
from app.security import generate_session_token, hash_password, verify_password
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


async def _create_session(db: AsyncIOMotorDatabase, user_id, remember: bool) -> str:
    token = generate_session_token()
    days = settings.SESSION_REMEMBER_DAYS if remember else settings.SESSION_DEFAULT_DAYS
    created, expires = db_module.ensure_expiry(days)
    await db[db_module.SESSIONS].insert_one(
        {
            "token": token,
            "user_id": user_id,
            "created_at": created,
            "expires_at": expires,
        }
    )
    return token


def _user_out(user) -> UserOut:
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


@router.post("/auth/signup", response_model=AuthResponse)
async def signup(
    payload: SignupRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    email = payload.email.lower().strip()

    existing = await db[db_module.USERS].find_one({"email": email})
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "EMAIL_TAKEN",
                "message": "An account with this email already exists. Try signing in instead.",
            },
        )

    user_doc = {
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "created_at": db_module.utcnow(),
        "updated_at": db_module.utcnow(),
    }
    result = await db[db_module.USERS].insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = await _create_session(db, result.inserted_id, remember=True)
    logger.info("New account created: %s", email)

    return AuthResponse(token=token, user=_user_out(user_doc))


@router.post("/auth/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    email = payload.email.lower().strip()
    user = await db[db_module.USERS].find_one({"email": email})
    if user is None or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "Incorrect email or password.",
            },
        )

    token = await _create_session(db, user["_id"], remember=payload.remember)
    logger.info("User signed in: %s", email)
    return AuthResponse(token=token, user=_user_out(user))


@router.post("/auth/logout", response_model=MessageResponse)
async def logout(
    db: AsyncIOMotorDatabase = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
):
    # Best-effort: remove the presented session token from MongoDB.
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if token:
        await db[db_module.SESSIONS].delete_one({"token": token})
    return MessageResponse(message="Signed out successfully.")


@router.get("/auth/me", response_model=UserOut)
async def me(user: UserOut = Depends(get_current_user)):
    return user


@router.post("/auth/change-password", response_model=MessageResponse)
async def change_password(
    payload: ChangePasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: UserOut = Depends(get_current_user),
):
    from bson import ObjectId

    doc = await db[db_module.USERS].find_one({"_id": ObjectId(user.id)})
    if doc is None or not verify_password(payload.currentPassword, doc.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "WRONG_PASSWORD",
                "message": "Your current password is incorrect.",
            },
        )

    await db[db_module.USERS].update_one(
        {"_id": ObjectId(user.id)},
        {"$set": {"password_hash": hash_password(payload.newPassword), "updated_at": db_module.utcnow()}},
    )
    # Invalidate every other session for this user so the new password takes
    # effect everywhere.
    await db[db_module.SESSIONS].delete_many({"user_id": ObjectId(user.id)})
    return MessageResponse(message="Password updated. Please sign in again.")
