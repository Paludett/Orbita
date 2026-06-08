from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
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


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


# TODO: register routers here as they are implemented
# app.include_router(areas.router, prefix="/areas", tags=["areas"])
# app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
# app.include_router(notes.router, prefix="/notes", tags=["notes"])
