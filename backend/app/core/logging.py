import logging
import sys
from contextvars import ContextVar

# Context variable to hold request correlation ID across async tasks
request_id_ctx_var: ContextVar[str] = ContextVar("request_id", default="-")


class CorrelationIdFilter(logging.Filter):
    """Logging filter that injects the current request correlation ID into the log record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx_var.get()
        return True


def setup_logging(log_level: str = "INFO") -> None:
    """Configure structured console logging for the application."""
    log_format = (
        "%(asctime)s | %(levelname)-7s | [%(request_id)s] | %(name)s:%(lineno)d - %(message)s"
    )
    formatter = logging.Formatter(fmt=log_format, datefmt="%Y-%m-%d %H:%M:%S")

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    handler.addFilter(CorrelationIdFilter())

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level.upper())

    # Replace root handlers
    for h in list(root_logger.handlers):
        root_logger.removeHandler(h)
    root_logger.addHandler(handler)

    # Configure uvicorn loggers to use the same handler & level
    for uvicorn_logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
        logger = logging.getLogger(uvicorn_logger_name)
        logger.handlers = [handler]
        logger.propagate = False
