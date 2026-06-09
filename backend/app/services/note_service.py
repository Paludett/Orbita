from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


async def get_notes(db: AsyncSession, area_id: str) -> list[Note]:
    stmt = (
        select(Note)
        .where(Note.area_id == area_id)
        .order_by(Note.updated_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_note(db: AsyncSession, note_id: str, area_id: str) -> Note:
    # SECURITY: filter by note_id AND area_id to prevent IDOR between areas
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.area_id == area_id)
    )
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )
    return note


async def create_note(db: AsyncSession, area_id: str, data: NoteCreate) -> Note:
    note = Note(
        title=data.title,
        content=data.content,
        area_id=area_id,
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


async def update_note(
    db: AsyncSession, note_id: str, area_id: str, data: NoteUpdate
) -> Note:
    note = await get_note(db, note_id, area_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    await db.commit()
    await db.refresh(note)
    return note


async def delete_note(db: AsyncSession, note_id: str, area_id: str) -> None:
    note = await get_note(db, note_id, area_id)
    await db.delete(note)
    await db.commit()
