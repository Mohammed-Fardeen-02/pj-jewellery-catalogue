from app.modules.ai.service import AiVisionService


def get_ai_vision_service() -> AiVisionService:
    """Dependency injector for AI Vision Service."""
    return AiVisionService()
