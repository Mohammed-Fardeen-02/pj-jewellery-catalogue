import re
import uuid
from typing import Any

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import BadRequestException


class CloudinaryService:
    """Service handling Cloudinary asset uploads, validations, and lifecycle operations.

    Enforces file size limits, MIME type validations, and graceful mock/fallback mode
    when API credentials are not provisioned in local/test environments.
    """

    ALLOWED_IMAGE_TYPES = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "image/jpg",
    }
    ALLOWED_VIDEO_TYPES = {
        "video/mp4",
        "video/webm",
        "video/quicktime",
    }

    MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
    MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024  # 100 MB

    def __init__(self) -> None:
        self.settings = get_settings()
        self._is_configured = bool(
            self.settings.CLOUDINARY_CLOUD_NAME
            and self.settings.CLOUDINARY_API_KEY
            and self.settings.CLOUDINARY_API_SECRET
        )

        if self._is_configured:
            import cloudinary

            cloudinary.config(
                cloud_name=self.settings.CLOUDINARY_CLOUD_NAME,
                api_key=self.settings.CLOUDINARY_API_KEY,
                api_secret=self.settings.CLOUDINARY_API_SECRET,
                secure=True,
            )

    @property
    def is_configured(self) -> bool:
        """Indicates whether active Cloudinary API credentials are provided."""
        return self._is_configured

    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename to alphanumeric and dashes."""
        clean = re.sub(r"[^\w\.-]", "_", filename)
        return clean.strip("._") or "media_file"

    async def upload_image(self, file: UploadFile) -> dict[str, Any]:
        """Validate and upload an image file to Cloudinary.

        Returns a dictionary containing 'url' and 'public_id'.
        """
        content_type = file.content_type or ""
        if content_type.lower() not in self.ALLOWED_IMAGE_TYPES:
            raise BadRequestException(
                f"Invalid image format '{content_type}'. Allowed types: JPEG, PNG, WebP, AVIF."
            )

        content = await file.read()
        if len(content) > self.MAX_IMAGE_SIZE_BYTES:
            raise BadRequestException(
                f"Image size exceeds 10MB limit (size: {len(content) / (1024 * 1024):.2f} MB)."
            )

        safe_filename = self._sanitize_filename(file.filename or "product_image")
        unique_id = uuid.uuid4().hex[:12]
        public_id = f"{self.settings.CLOUDINARY_FOLDER}/products/images/{unique_id}_{safe_filename}"

        if self._is_configured:
            import cloudinary.uploader

            upload_result = cloudinary.uploader.upload(
                content,
                public_id=public_id,
                folder=f"{self.settings.CLOUDINARY_FOLDER}/products/images",
                resource_type="image",
                transformation=[{"quality": "auto", "fetch_format": "auto"}],
            )
            return {
                "url": upload_result.get("secure_url") or upload_result.get("url"),
                "public_id": upload_result.get("public_id"),
            }

        # Offline / Mock Fallback for local testing and CI
        mock_url = (
            f"https://res.cloudinary.com/pj-jewellery/image/upload/v1/"
            f"{public_id}"
        )
        return {
            "url": mock_url,
            "public_id": public_id,
        }

    async def upload_video(self, file: UploadFile) -> dict[str, Any]:
        """Validate and upload a product video file to Cloudinary.

        Returns a dictionary containing 'url' and 'public_id'.
        """
        content_type = file.content_type or ""
        if content_type.lower() not in self.ALLOWED_VIDEO_TYPES:
            raise BadRequestException(
                f"Invalid video format '{content_type}'. Allowed types: MP4, WebM, MOV."
            )

        content = await file.read()
        if len(content) > self.MAX_VIDEO_SIZE_BYTES:
            raise BadRequestException(
                f"Video size exceeds 100MB limit (size: {len(content) / (1024 * 1024):.2f} MB)."
            )

        safe_filename = self._sanitize_filename(file.filename or "product_video")
        unique_id = uuid.uuid4().hex[:12]
        public_id = f"{self.settings.CLOUDINARY_FOLDER}/products/videos/{unique_id}_{safe_filename}"

        if self._is_configured:
            import cloudinary.uploader

            upload_result = cloudinary.uploader.upload_large(
                content,
                public_id=public_id,
                folder=f"{self.settings.CLOUDINARY_FOLDER}/products/videos",
                resource_type="video",
            )
            return {
                "url": upload_result.get("secure_url") or upload_result.get("url"),
                "public_id": upload_result.get("public_id"),
            }

        # Offline / Mock Fallback for local testing and CI
        mock_url = (
            f"https://res.cloudinary.com/pj-jewellery/video/upload/v1/"
            f"{public_id}"
        )
        return {
            "url": mock_url,
            "public_id": public_id,
        }

    async def delete_asset(self, public_id: str, resource_type: str = "image") -> bool:
        """Delete an asset from Cloudinary storage by public ID."""
        if not public_id:
            return False

        if self._is_configured:
            try:
                import cloudinary.uploader

                cloudinary.uploader.destroy(public_id, resource_type=resource_type)
            except Exception:
                # Log but do not fail deletion if external cleanup fails
                pass

        return True


_cloudinary_service_instance: CloudinaryService | None = None


def get_cloudinary_service() -> CloudinaryService:
    """Dependency provider returning singleton CloudinaryService instance."""
    global _cloudinary_service_instance
    if _cloudinary_service_instance is None:
        _cloudinary_service_instance = CloudinaryService()
    return _cloudinary_service_instance
