"""Secure administrator bootstrap script.

Prompts for or reads email/password from environment, validates strength,
hashes password using Argon2, and seeds the initial administrator account.
"""

import asyncio
import getpass
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.security import get_password_hash
from app.db.session import async_session_factory
from app.models.user import User
from app.repositories.user_repository import UserRepository


async def seed_administrator() -> None:
    email = os.getenv("SEED_ADMIN_EMAIL")
    password = os.getenv("SEED_ADMIN_PASSWORD")

    if not email:
        email = input("Enter administrator email: ").strip()

    if not password:
        password = getpass.getpass("Enter administrator password: ").strip()
        confirm = getpass.getpass("Confirm administrator password: ").strip()
        if password != confirm:
            print("Error: Passwords do not match.", file=sys.stderr)
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

        if existing:
            print(f"Notice: Administrator account '{email}' already exists. Skipping.")
            return

        hashed_password = get_password_hash(password)
        new_admin = User(
            email=email,
            hashed_password=hashed_password,
            full_name="Initial Administrator",
            role="super_admin",
            is_active=True,
        )

        await user_repo.create(new_admin)
        await session.commit()
        print(f"Success: Administrator '{email}' created successfully.")


if __name__ == "__main__":
    asyncio.run(seed_administrator())
