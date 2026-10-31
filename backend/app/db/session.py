from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings


def create_engine() -> AsyncEngine:
    """Instantiate the async SQLAlchemy engine based on application settings."""
    settings = get_settings()
    engine_kwargs: dict = {
        "pool_pre_ping": settings.DATABASE_POOL_PRE_PING,
        "echo": settings.DEBUG and settings.is_development,
    }

    # SQLite does not support pool_size and max_overflow
    if not settings.DATABASE_URL.startswith("sqlite"):
        engine_kwargs["pool_size"] = settings.DATABASE_POOL_SIZE
        engine_kwargs["max_overflow"] = settings.DATABASE_MAX_OVERFLOW
        engine_kwargs["pool_timeout"] = settings.DATABASE_POOL_TIMEOUT

    engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

    # Cross-compatibility: register PostgreSQL-compatible now() function in SQLite
    if settings.DATABASE_URL.startswith("sqlite"):
        from datetime import UTC, datetime
        from sqlalchemy import event

        @event.listens_for(engine.sync_engine, "connect")
        def _sqlite_connect(dbapi_connection, connection_record):
            dbapi_connection.create_function(
                "now", 0, lambda: datetime.now(UTC).isoformat()
            )

    return engine


# Application-level engine and session maker
engine: AsyncEngine = create_engine()

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a request-scoped async database session context.

    Ensures session commit on success, rollback on error, and clean closing.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
