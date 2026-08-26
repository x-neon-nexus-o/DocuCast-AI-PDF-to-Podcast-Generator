from fastapi import APIRouter
from app.schemas.podcast import HealthResponse
from app.config import settings
from app import db as db_module

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    db_info = await db_module.database_status()
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        message="DocuCast backend is running.",
        database=db_info,
    )
