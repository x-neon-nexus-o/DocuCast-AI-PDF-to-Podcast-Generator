"""MongoDB connection management for DocuCast.

Uses Motor (the async MongoDB driver for Python). The application stores:

- users        : user accounts (email unique, bcrypt-hashed passwords)
- sessions     : login sessions (opaque bearer tokens with TTL expiry)
- documents    : uploaded PDF metadata owned by a user
- podcasts     : generated podcasts (script, summary, chapters, audio base64)
                owned by a user

If no real MongoDB is reachable AND MONGODB_URI was not explicitly configured,
the app falls back to an in-memory MongoDB emulator (mongomock) so the whole
stack can still be exercised locally. Health endpoint reports which engine is
in use so the difference is never hidden.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

logger = logging.getLogger(__name__)

_real_client: Optional[AsyncIOMotorClient] = None
_emulator_client: Optional[Any] = None  # AsyncMongoMockClient when in fallback mode
_using_emulator = False
_started = False

# Collection names
USERS = "users"
SESSIONS = "sessions"
DOCUMENTS = "documents"
PODCASTS = "podcasts"


def _new_real_client() -> AsyncIOMotorClient:
    return AsyncIOMotorClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=settings.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
        connectTimeoutMS=settings.MONGODB_CONNECT_TIMEOUT_MS,
    )


async def _ping(client: Any) -> bool:
    """Best-effort ping that works with both Motor and mongomock clients."""
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        try:
            await client.server_info()  # type: ignore[attr-defined]
            return True
        except Exception:
            return False


async def connect_database() -> Dict[str, Any]:
    """Connect to MongoDB (or start the in-memory emulator fallback).

    Returns an info dict describing which engine is active.
    """
    global _real_client, _emulator_client, _using_emulator, _started

    # 1) Try a real MongoDB server (explicit URI or localhost default).
    try:
        client = _new_real_client()
        if await _ping(client):
            _real_client = client
            _using_emulator = False
            _started = True
            logger.info(
                "MongoDB connected: %s/%s",
                settings.mongodb_uri,
                settings.MONGODB_DB_NAME,
            )
            return {"engine": "mongodb", "persistent": True}
    except Exception as exc:  # pragma: no cover - exercised via integration
        logger.warning("MongoDB connection attempt failed: %s", exc)

    # 2) Explicitly configured URI but unreachable -> surface the error.
    if settings.mongodb_uri_explicit:
        raise ConnectionError(
            "MongoDB at the configured MONGODB_URI is unreachable. "
            "Please check that the database server is running and MONGODB_URI is correct."
        )

    # 3) No explicit URI -> run on an in-memory emulator for local dev/demo.
    from mongomock_motor import AsyncMongoMockClient

    _emulator_client = AsyncMongoMockClient()
    _real_client = None
    _using_emulator = True
    _started = True
    logger.warning(
        "MongoDB not reachable at %s — starting with an IN-MEMORY MongoDB "
        "emulator. Data will NOT persist after the backend stops. Set "
        "MONGODB_URI to a real MongoDB (local or Atlas) for persistent storage.",
        settings.mongodb_uri,
    )
    return {"engine": "mongodb-emulator", "persistent": False}


async def close_database() -> None:
    """Close the real client; the in-memory emulator needs no cleanup."""
    global _real_client, _started
    if _real_client is not None:
        try:
            _real_client.close()
        except Exception:  # pragma: no cover
            pass
        _real_client = None
    _started = False


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database handle (real or emulated)."""
    if _emulator_client is not None:
        return _emulator_client[settings.MONGODB_DB_NAME]
    if _real_client is not None:
        return _real_client[settings.MONGODB_DB_NAME]
    # Lazy connect: if a route is hit before lifespan finished connecting
    # (e.g. in unit tests), fall back to a fresh real client attempt.
    _real_client = _new_real_client()
    return _real_client[settings.MONGODB_DB_NAME]


async def database_status() -> Dict[str, Any]:
    """Status info for the health endpoint."""
    try:
        db = get_database()
        ok = await _ping(db.client if hasattr(db, "client") else db)
        return {
            "connected": ok,
            "engine": "mongodb-emulator" if _using_emulator else "mongodb",
            "persistent": not _using_emulator,
            "database": settings.MONGODB_DB_NAME,
        }
    except Exception as exc:
        return {"connected": False, "engine": "mongodb", "persistent": True, "error": str(exc)}


async def init_db() -> None:
    """Create collections/indexes on the active database."""
    db = get_database()
    await db[USERS].create_index("email", unique=True)
    await db[SESSIONS].create_index("token", unique=True)
    # TTL index: MongoDB automatically deletes expired sessions.
    await db[SESSIONS].create_index("expires_at", expireAfterSeconds=0)
    await db[DOCUMENTS].create_index([("user_id", 1), ("created_at", -1)])
    await db[PODCASTS].create_index([("user_id", 1), ("created_at", -1)])
    logger.info("MongoDB indexes ensured on database '%s'.", settings.MONGODB_DB_NAME)


def utcnow() -> datetime:
    """Naive-UTC now — MongoDB stores/compares datetimes as UTC."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def iso_date(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def new_id() -> str:
    from bson import ObjectId

    return str(ObjectId())


def serialize_id(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a MongoDB document's ObjectId _id into a string 'id'."""
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id", ""))
    return doc


def to_object_id(value: str):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        return ObjectId(value)
    except InvalidId:
        return None


def ensure_expiry(days: int) -> Tuple[datetime, datetime]:
    """Return (created_at, expires_at) for a session TTL of `days`."""
    created = utcnow()
    expires = created + timedelta(days=days)
    return created, expires


# Alias kept for readability in routes
OptionalDict = Optional[Dict[str, Any]]
