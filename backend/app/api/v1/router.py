from fastapi import APIRouter

from app.api.v1.endpoints import auth, brands, health
from app.modules.ai.routes import admin_router as ai_admin_router
from app.modules.analytics.routes import router as analytics_router
from app.modules.categories.routes import admin_router as category_admin_router
from app.modules.categories.routes import public_router as category_public_router
from app.modules.orders.routes import admin_router as order_admin_router
from app.modules.orders.routes import public_router as order_public_router
from app.modules.products.routes import admin_router as product_admin_router
from app.modules.products.routes import public_router as product_public_router
from app.modules.stock.routes import router as stock_router

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
api_router.include_router(
    stock_router, prefix="/admin", tags=["Stock & Inventory (Admin)"]
)
api_router.include_router(
    order_admin_router, prefix="/admin/orders", tags=["Orders (Admin)"]
)
api_router.include_router(
    analytics_router, prefix="/admin/analytics", tags=["Analytics (Admin)"]
)
api_router.include_router(
    ai_admin_router, prefix="/admin/ai", tags=["AI Vision (Admin)"]
)

# Public Storefront APIs
api_router.include_router(
    category_public_router, prefix="/public/categories", tags=["Categories (Public)"]
)
api_router.include_router(
    product_public_router, prefix="/public/products", tags=["Products (Public)"]
)
api_router.include_router(
    order_public_router, prefix="/public/orders", tags=["Orders (Public)"]
)

# Brand Architecture Notice
api_router.include_router(brands.router, prefix="/brands", tags=["Brands"])

