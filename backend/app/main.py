from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.areas import router as areas_router
from app.routers.auth import router as auth_router

app = FastAPI(title="Orbita API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(areas_router, prefix="/areas", tags=["areas"])


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
