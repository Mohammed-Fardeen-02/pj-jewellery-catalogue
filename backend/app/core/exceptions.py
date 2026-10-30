from typing import Any

from fastapi import status


class AppException(Exception):
    """Base application exception for domain errors."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        code: str = "INTERNAL_SERVER_ERROR",
        details: list[dict[str, Any]] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details or []


class NotFoundException(AppException):
    """Raised when a requested resource does not exist."""

    def __init__(
        self, message: str = "Resource not found", details: list[dict[str, Any]] | None = None
    ) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            details=details,
        )


class UnauthorizedException(AppException):
    """Raised when authentication credentials are missing or invalid."""

    def __init__(
        self,
        message: str = "Could not validate credentials",
        details: list[dict[str, Any]] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            details=details,
        )


class ForbiddenException(AppException):
    """Raised when the user does not have permission to access the resource."""

    def __init__(
        self,
        message: str = "You do not have permission to perform this action",
        details: list[dict[str, Any]] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            details=details,
        )


class BadRequestException(AppException):
    """Raised when client input fails semantic validation."""

    def __init__(
        self, message: str = "Bad request", details: list[dict[str, Any]] | None = None
    ) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="BAD_REQUEST",
            details=details,
        )


class ConflictException(AppException):
    """Raised when a resource state conflict occurs (e.g. duplicate unique key)."""

    def __init__(
        self, message: str = "Resource conflict", details: list[dict[str, Any]] | None = None
    ) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            code="CONFLICT",
            details=details,
        )


class DatabaseConnectionException(AppException):
    """Raised when database connectivity fails."""

    def __init__(
        self,
        message: str = "Database service is temporarily unavailable",
        details: list[dict[str, Any]] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="DATABASE_UNAVAILABLE",
            details=details,
        )
