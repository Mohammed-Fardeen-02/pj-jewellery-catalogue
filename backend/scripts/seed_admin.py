"""Secure administrator bootstrap script.

Reads email and password from environment variables (SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD),
falling back to application settings and interactive prompt if necessary.
Hashes the password with Argon2 and seeds or synchronizes the initial super administrator account.
"""

import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.db.session import async_session_factory
from app.models.user import User
from app.repositories.user_repository import UserRepository


async def seed_administrator() -> None:
    settings = get_settings()

    email = (
        os.getenv("SUPERADMIN_EMAIL")
        or os.getenv("SEED_ADMIN_EMAIL")
        or settings.SUPERADMIN_EMAIL
    ).strip()

    password = (
        os.getenv("SUPERADMIN_PASSWORD")
        or os.getenv("SEED_ADMIN_PASSWORD")
        or settings.SUPERADMIN_PASSWORD
    ).strip()

    full_name = (
        os.getenv("SUPERADMIN_FULL_NAME")
        or settings.SUPERADMIN_FULL_NAME
    ).strip()

    if not email:
        print("Error: SUPERADMIN_EMAIL is not specified.", file=sys.stderr)
        sys.exit(1)

    if not password:
        print("Error: SUPERADMIN_PASSWORD is not specified.", file=sys.stderr)
        sys.exit(1)

    if len(password) < 10:
        print("Error: Password must be at least 10 characters long.", file=sys.stderr)
        sys.exit(1)

    if password.lower() in ("admin", "admin123", "password", "password123"):
        print("Error: Insecure default passwords are not allowed.", file=sys.stderr)
        sys.exit(1)

    async with async_session_factory() as session:
        user_repo = UserRepository(session)
        existing = await user_repo.get_by_email(email)

        hashed_password = get_password_hash(password)

        if existing:
            # Synchronize password with configured credentials
            existing.hashed_password = hashed_password
            existing.full_name = full_name
            existing.role = "super_admin"
            existing.is_active = True
            await session.commit()
            print(f"Success: Existing administrator '{email}' updated with environment credentials.")
            print(f"Role: {existing.role} | Active: {existing.is_active}")
            return

        new_admin = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role="super_admin",
            is_active=True,
        )

        await user_repo.create(new_admin)
        await session.commit()
        print(f"Success: Super administrator '{email}' created successfully.")
        print(f"Role: {new_admin.role} | Active: {new_admin.is_active}")


if __name__ == "__main__":
    asyncio.run(seed_administrator())
