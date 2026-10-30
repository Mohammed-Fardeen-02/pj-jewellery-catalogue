from app.schemas.common import PaginationParams
from app.utils.pagination import build_paginated_response
from app.utils.slug import generate_slug


def test_generate_slug_basic():
    assert generate_slug("18K Gold Diamond Ring") == "18k-gold-diamond-ring"


def test_generate_slug_special_characters():
    assert (
        generate_slug("Solitaire & Emerald Cut — Special Edition!")
        == "solitaire-emerald-cut-special-edition"
    )


def test_generate_slug_unicode_accents():
    assert generate_slug("Bague Fiancée Émeraude") == "bague-fiancee-emeraude"


def test_generate_slug_empty_or_whitespace():
    assert generate_slug("") == ""
    assert generate_slug("   ") == ""
    assert generate_slug("---") == ""


def test_pagination_params_offset():
    p1 = PaginationParams(page=1, limit=20)
    assert p1.offset == 0

    p2 = PaginationParams(page=3, limit=10)
    assert p2.offset == 20


def test_build_paginated_response():
    items = ["item1", "item2", "item3"]
    paginated = build_paginated_response(items=items, total=25, page=1, limit=10)

    assert paginated.total == 25
    assert paginated.page == 1
    assert paginated.limit == 10
    assert paginated.total_pages == 3
    assert paginated.items == items
