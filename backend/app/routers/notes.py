from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import verify_area_ownership
from app.db.session import get_db
from app.models.area import Area
from app.schemas.note import (
    NoteCreate,
    NoteDetailResponse,
    NoteSummaryResponse,
    NoteUpdate,
)
from app.services import note_service

router = APIRouter()


@router.get("/areas/{area_id}/notes", response_model=list[NoteSummaryResponse])
async def list_notes(
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    return await note_service.get_notes(db, area.id)


@router.post(
    "/areas/{area_id}/notes",
    response_model=NoteDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_note(
    data: NoteCreate,
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    return await note_service.create_note(db, area.id, data)


@router.get("/areas/{area_id}/notes/{note_id}", response_model=NoteDetailResponse)
async def get_note(
    note_id: str,
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    return await note_service.get_note(db, note_id, area.id)


@router.patch("/areas/{area_id}/notes/{note_id}", response_model=NoteDetailResponse)
async def update_note(
    note_id: str,
    data: NoteUpdate,
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    return await note_service.update_note(db, note_id, area.id, data)


@router.delete(
    "/areas/{area_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_note(
    note_id: str,
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    await note_service.delete_note(db, note_id, area.id)
