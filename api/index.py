import logging
import sys
import traceback
from pathlib import Path

# Add backend directory to sys.path so app modules can be resolved
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if backend_dir.exists() and str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
elif str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

try:
    from app.main import app

    handler = app
except Exception as exc:
    logging.error("FATAL: Failed to initialize FastAPI backend application: %s", exc)
    traceback.print_exc()
    raise
