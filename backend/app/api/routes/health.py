from fastapi import APIRouter
from app.schemas.podcast import HealthResponse
from app.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        message="DocuCast backend is running.",
    )
