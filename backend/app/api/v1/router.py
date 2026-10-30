from fastapi import APIRouter

from app.api.v1.endpoints import auth, brands, health
from app.modules.categories.routes import admin_router as category_admin_router
from app.modules.categories.routes import public_router as category_public_router
from app.modules.products.routes import admin_router as product_admin_router
from app.modules.products.routes import public_router as product_public_router

api_router = APIRouter()

# Health Probes
api_router.include_router(health.router, prefix="/health", tags=["Health"])

# Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Admin Master Management
api_router.include_router(
    category_admin_router, prefix="/admin/categories", tags=["Categories (Admin)"]
)
api_router.include_router(
    product_admin_router, prefix="/admin/products", tags=["Products (Admin)"]
)

# Public Storefront APIs
api_router.include_router(
    category_public_router, prefix="/public/categories", tags=["Categories (Public)"]
)
api_router.include_router(
    product_public_router, prefix="/public/products", tags=["Products (Public)"]
)

# Brand Architecture Notice
api_router.include_router(brands.router, prefix="/brands", tags=["Brands"])
