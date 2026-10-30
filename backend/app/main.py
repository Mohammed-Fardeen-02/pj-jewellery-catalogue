import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import AppException
from app.core.logging import request_id_ctx_var, setup_logging
from app.db.session import engine
from app.middlewares.request_context import RequestContextMiddleware

logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup and graceful shutdown."""
    settings = get_settings()
    setup_logging(log_level=settings.LOG_LEVEL)
    logger.info("Starting %s in [%s] mode...", settings.APP_NAME, settings.APP_ENV)

    yield

    logger.info("Shutting down %s, disposing database connection pool...", settings.APP_NAME)
    await engine.dispose()
    logger.info("Cleanup complete.")


def create_application() -> FastAPI:
    """FastAPI application factory with middleware, error handlers, and routing."""
    settings = get_settings()

    app = FastAPI(
        title="PJ — AI-Powered Jewellery Catalogue API",
        description=(
            "Production-ready backend foundation for PJ Jewellery Catalogue application. "
            "Features asynchronous PostgreSQL persistence, JWT authentication with Argon2 "
            "password hashing, comprehensive error handling, structured logging, and "
            "versioned routing."
        ),
        version="0.1.0",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # 1. Cross-Origin Resource Sharing (CORS)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # 2. Request context & Correlation ID middleware
    app.add_middleware(RequestContextMiddleware)

    # 3. Global Exception Handlers
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        correlation_id = request_id_ctx_var.get()
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
                "request_id": correlation_id,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        correlation_id = request_id_ctx_var.get()
        formatted_details = []
        for error in exc.errors():
            loc = ".".join(str(item) for item in error.get("loc", []))
            formatted_details.append(
                {
                    "field": loc,
                    "issue": error.get("msg", "Invalid value"),
                }
            )

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Input validation failed",
                    "details": formatted_details,
                },
                "request_id": correlation_id,
            },
        )

    @app.exception_handler(StarletteHTTPException)
    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        request: Request, exc: HTTPException | StarletteHTTPException
    ) -> JSONResponse:
        correlation_id = request_id_ctx_var.get()
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": "HTTP_ERROR",
                    "message": exc.detail,
                    "details": [],
                },
                "request_id": correlation_id,
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        correlation_id = request_id_ctx_var.get()
        # Log complete stack trace internally; return safe message to client
        logger.exception("Unhandled server exception: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected internal server error occurred",
                    "details": [],
                },
                "request_id": correlation_id,
            },
        )

    # 4. Root Health Probe
    @app.get(
        "/health",
        tags=["Health"],
        summary="Application Process Health",
        description="Top-level process health endpoint for container healthchecks.",
    )
    async def process_health():
        return {
            "status": "healthy",
            "service": settings.APP_NAME,
            "version": "0.1.0",
            "environment": settings.APP_ENV,
        }

    # 5. Include Versioned v1 API Router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    return app


app = create_application()
