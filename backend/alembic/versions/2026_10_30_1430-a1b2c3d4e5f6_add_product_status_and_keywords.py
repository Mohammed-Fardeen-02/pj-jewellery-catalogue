"""add_product_status_and_keywords

Revision ID: a1b2c3d4e5f6
Revises: 6434264bfb7a
Create Date: 2026-10-30 14:30:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: str | None = "6434264bfb7a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

product_status_enum = postgresql.ENUM("draft", "published", "archived", name="product_status_enum")


def upgrade() -> None:
    # Create enum type if on postgres
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        product_status_enum.create(bind, checkfirst=True)
        status_col_type = product_status_enum
        keywords_default = sa.text("'[]'::json")
    else:
        status_col_type = sa.String(length=20)
        keywords_default = sa.text("'[]'")

    # 1. Add keywords JSON column to products
    op.add_column(
        "products",
        sa.Column(
            "keywords",
            sa.JSON(),
            nullable=False,
            server_default=keywords_default,
        ),
    )

    # 2. Add status column to products
    op.add_column(
        "products",
        sa.Column(
            "status",
            status_col_type,
            nullable=False,
            server_default="draft",
        ),
    )
    op.create_index(op.f("ix_products_status"), "products", ["status"], unique=False)

    # 3. Synchronize existing products: if is_published was True, set status = 'published'
    if bind.dialect.name == "postgresql":
        op.execute(
            "UPDATE products SET status = 'published' WHERE is_published = TRUE"
        )
    else:
        op.execute(
            "UPDATE products SET status = 'published' WHERE is_published = 1"
        )


def downgrade() -> None:
    op.drop_index(op.f("ix_products_status"), table_name="products")
    op.drop_column("products", "status")
    op.drop_column("products", "keywords")

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        product_status_enum.drop(bind, checkfirst=True)
