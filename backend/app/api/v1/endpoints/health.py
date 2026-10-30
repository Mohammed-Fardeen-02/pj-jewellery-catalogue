import logging
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.dependencies.database import get_db

logger = logging.getLogger("app.api.health")
router = APIRouter()


@router.get(
    "/live",
    summary="Process Liveness Check",
    description="Confirms that the FastAPI process is responsive and receiving requests.",
    status_code=status.HTTP_200_OK,
)
async def liveness_check() -> dict[str, str]:
    """Lightweight process liveness probe."""
    settings = get_settings()
    return {
        "status": "live",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "timestamp": datetime.now(UTC).isoformat(),
    }


@router.get(
    "/ready",
    summary="Database Readiness Check",
    description=(
        "Verifies database connectivity by executing a lightweight query. "
        "Returns 503 if unavailable."
    ),
    responses={
        status.HTTP_200_OK: {
            "description": "Database is connected and ready.",
            "content": {
                "application/json": {
                    "example": {
                        "status": "ready",
                        "database": "connected",
                        "timestamp": "2026-10-29T11:00:00Z",
                    }
                }
            },
        },
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "description": "Database connection failed or timed out.",
            "content": {
                "application/json": {
                    "example": {
                        "status": "not_ready",
                        "database": "disconnected",
                        "error": "Database service is unavailable",
                        "timestamp": "2026-10-29T11:00:00Z",
                    }
                }
            },
        },
    },
)
async def readiness_check(db: AsyncSession = Depends(get_db)) -> JSONResponse:
    """Verifies that the database connection pool is healthy and reachable.

    Catches connection failures securely without leaking internal hostnames,
    credentials, or tracebacks to the client.
    """
    now = datetime.now(UTC).isoformat()
    try:
        # Minimal probe query
        result = await db.execute(text("SELECT 1"))
        scalar_val = result.scalar()
        if scalar_val != 1:
            raise RuntimeError("Database query returned unexpected result")

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "ready",
                "database": "connected",
                "timestamp": now,
            },
        )
    except Exception as exc:
        # Log internal diagnostic details securely on server-side only
        logger.error("Database readiness check failed: %s: %s", type(exc).__name__, exc)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "database": "disconnected",
                "error": "Database service is unavailable",
                "timestamp": now,
            },
        )
