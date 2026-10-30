import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_default_settings():
    settings = Settings()
    assert settings.APP_NAME == "PJ Jewellery Catalogue API"
    assert settings.is_development is True
    assert settings.is_production is False
    assert settings.JWT_ALGORITHM == "HS256"


def test_invalid_database_driver():
    with pytest.raises(ValidationError) as exc_info:
        Settings(DATABASE_URL="postgresql://user:pass@localhost:5432/db")
    assert "DATABASE_URL must use an async driver" in str(exc_info.value)


def test_production_short_secret_rejected():
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="short-secret",
            DEBUG=False,
        )
    assert "JWT_SECRET_KEY must be a secure key with at least 32 characters" in str(exc_info.value)


def test_production_debug_mode_rejected():
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="a-very-long-production-grade-secret-key-32-chars",
            DEBUG=True,
        )
    assert "DEBUG mode must not be enabled in production environment" in str(exc_info.value)


def test_allowed_origins_parsing():
    settings = Settings(ALLOWED_ORIGINS="http://example.com, http://app.example.com")
    assert "http://example.com" in settings.ALLOWED_ORIGINS
    assert "http://app.example.com" in settings.ALLOWED_ORIGINS
