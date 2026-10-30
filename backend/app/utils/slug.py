import re
import unicodedata


def generate_slug(text: str) -> str:
    """Generate a clean, URL-friendly slug from an input string.

    Normalizes unicode characters, replaces non-alphanumeric sequences with hyphens,
    and strips leading/trailing hyphens.
    """
    if not text:
        return ""

    # Normalize unicode characters to closest ASCII equivalent
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")

    # Lowercase and convert non-alphanumeric chars to hyphens
    slug = re.sub(r"[^\w\s-]", "", normalized).strip().lower()
    slug = re.sub(r"[-\s]+", "-", slug)

    return slug.strip("-")
