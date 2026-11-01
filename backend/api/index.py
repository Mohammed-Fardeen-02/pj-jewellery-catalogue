import logging
import sys
import traceback
from pathlib import Path

# Add backend directory to sys.path so app modules can be resolved
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

try:
    from app.main import app

    handler = app
except Exception as exc:
    logging.error("FATAL: Failed to initialize FastAPI backend application: %s", exc)
    traceback.print_exc()
    raise
