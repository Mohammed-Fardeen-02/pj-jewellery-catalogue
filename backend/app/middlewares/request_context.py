import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import request_id_ctx_var

logger = logging.getLogger("app.middleware.request_context")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Middleware that assigns a correlation ID and records request duration.

    Security Note:
    Explicitly avoids logging request bodies, authorization headers, or cookies.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Extract or generate correlation ID
        correlation_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        token = request_id_ctx_var.set(correlation_id)

        start_time = time.perf_counter()
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path

        logger.info("Incoming HTTP %s %s from %s", method, path, client_ip)

        try:
            response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000
            response.headers["X-Request-ID"] = correlation_id

            logger.info(
                "Completed HTTP %s %s -> status %d in %.2fms",
                method,
                path,
                response.status_code,
                duration_ms,
            )
            return response
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                "Unhandled error during HTTP %s %s after %.2fms: %s",
                method,
                path,
                duration_ms,
                type(exc).__name__,
            )
            raise
        finally:
            request_id_ctx_var.reset(token)
