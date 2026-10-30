"""add_product_media_and_is_active

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-10-30 15:10:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: str | None = "a1b2c3d4e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Add is_active column to products (default True)
    op.add_column(
        "products",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
    )
    op.create_index(op.f("ix_products_is_active"), "products", ["is_active"], unique=False)

    # 2. Add video_url column to products
    op.add_column(
        "products",
        sa.Column(
            "video_url",
            sa.String(length=512),
            nullable=True,
        ),
    )

    # 3. Add public_id column to product_images for Cloudinary asset tracking
    op.add_column(
        "product_images",
        sa.Column(
            "public_id",
            sa.String(length=255),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("product_images", "public_id")
    op.drop_column("products", "video_url")
    op.drop_index(op.f("ix_products_is_active"), table_name="products")
    op.drop_column("products", "is_active")
