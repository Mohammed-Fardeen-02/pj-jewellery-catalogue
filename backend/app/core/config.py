from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings and environment validation using Pydantic Settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    # Core Application
    APP_NAME: str = Field(
        default="PJ Jewellery Catalogue API", description="Name of the application"
    )
    APP_ENV: Literal["development", "staging", "production", "test"] = Field(
        default="development", description="Current operating environment"
    )
    API_V1_PREFIX: str = Field(default="/api/v1", description="Prefix for API v1 routes")
    DEBUG: bool = Field(default=False, description="Debug mode flag")

    # Server Bindings
    HOST: str = Field(default="0.0.0.0", description="Bind host")
    PORT: int = Field(default=8000, description="Bind port")

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/pj_jewellery_dev",
        description="Async PostgreSQL connection URL",
    )
    DATABASE_POOL_SIZE: int = Field(default=10, ge=1, le=50)
    DATABASE_MAX_OVERFLOW: int = Field(default=20, ge=0, le=100)
    DATABASE_POOL_TIMEOUT: int = Field(default=30, ge=1)
    DATABASE_POOL_PRE_PING: bool = Field(default=True)

    # Security & Tokens
    JWT_SECRET_KEY: str = Field(
        default="replace-this-with-a-secure-random-secret-key-at-least-32-chars-long",
        description="Secret key for signing JWT tokens",
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT signing algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440, ge=1)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, ge=1)

    # Initial Super Administrator Seeding Credentials
    SUPERADMIN_EMAIL: str = Field(
        default="admin@pjjewellery.com",
        description="Initial super admin bootstrap email",
    )
    SUPERADMIN_PASSWORD: str = Field(
        default="Admin@PJ2026!Secured",
        description="Initial super admin bootstrap password",
    )
    SUPERADMIN_FULL_NAME: str = Field(
        default="PJ Super Administrator",
        description="Initial super admin display name",
    )

    # CORS & Frontend Integration
    FRONTEND_URL: str = Field(default="http://localhost:3000")
    ALLOWED_ORIGINS: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    # Logging
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(default="INFO")

    # Cloudinary Object & Media Storage
    CLOUDINARY_CLOUD_NAME: str | None = Field(default=None, description="Cloudinary cloud name")
    CLOUDINARY_API_KEY: str | None = Field(default=None, description="Cloudinary API key")
    CLOUDINARY_API_SECRET: str | None = Field(default=None, description="Cloudinary API secret")
    CLOUDINARY_FOLDER: str = Field(
        default="", description="Cloudinary asset folder prefix"
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        # Require asynchronous driver for PostgreSQL (asyncpg) or SQLite (aiosqlite)
        if not (v.startswith("postgresql+asyncpg://") or v.startswith("sqlite+aiosqlite://")):
            raise ValueError(
                "DATABASE_URL must use an async driver: 'postgresql+asyncpg://' or 'sqlite+aiosqlite://'"
            )
        return v

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            if v.strip().startswith("[") and v.strip().endswith("]"):
                import json

                return json.loads(v)
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        # In staging or production, ensure no placeholder or insecure short secrets are used
        if self.APP_ENV in ("staging", "production"):
            if "replace-this" in self.JWT_SECRET_KEY or len(self.JWT_SECRET_KEY) < 32:
                raise ValueError(
                    f"In {self.APP_ENV} environment, JWT_SECRET_KEY must be a secure key "
                    "with at least 32 characters."
                )
            if self.DEBUG:
                raise ValueError(f"DEBUG mode must not be enabled in {self.APP_ENV} environment.")
        return self

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def is_test(self) -> bool:
        return self.APP_ENV == "test"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    """Return cached instance of application settings."""
    return Settings()
