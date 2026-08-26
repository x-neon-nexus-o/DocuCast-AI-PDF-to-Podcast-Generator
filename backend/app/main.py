import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app import db as db_module
from app.api.routes import health, podcast, auth, documents, podcasts

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MongoDB (with in-memory fallback for dev when no URI is set).
    try:
        info = await db_module.connect_database()
        await db_module.init_db()
        logger.info(
            "Database ready: engine=%s persistent=%s",
            info.get("engine"),
            info.get("persistent"),
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Database startup failed: %s", exc)
    yield
    await db_module.close_database()


app = FastAPI(
    title="DocuCast API",
    description="Convert PDF documents into podcast-style educational audio. "
    "User accounts, sessions, documents and podcasts are stored in MongoDB.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(documents.router, prefix=settings.API_PREFIX)
app.include_router(podcasts.router, prefix=settings.API_PREFIX)
app.include_router(podcast.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    db_target = (
        settings.mongodb_uri
        if settings.mongodb_uri_explicit
        else "mongodb://localhost:27017 (or in-memory fallback)"
    )
    return {
        "message": "DocuCast backend running.",
        "version": settings.APP_VERSION,
        "database": db_target,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logging.getLogger(__name__).error("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
            },
        },
    )
