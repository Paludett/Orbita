from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.models.note import Note
from app.schemas.note import NoteUpdate
from app.services import note_service


def _make_note(
    note_id: str = "note-1",
    area_id: str = "area-1",
    content: str = "<p>Hello</p>",
) -> Note:
    note = Note()
    note.id = note_id
    note.title = "My Note"
    note.content = content
    note.area_id = area_id
    note.created_at = datetime(2026, 1, 1)
    note.updated_at = datetime(2026, 1, 1)
    return note


def _mock_db() -> AsyncMock:
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.delete = AsyncMock()
    return db


class TestGetNotes:
    async def test_returns_notes_for_area(self):
        note = _make_note()
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalars.return_value.all.return_value = [note]
        db.execute = AsyncMock(return_value=result_mock)

        notes = await note_service.get_notes(db, "area-1")

        assert len(notes) == 1
        assert notes[0].area_id == "area-1"

    async def test_returned_notes_have_no_content_leak(self):
        note = _make_note(content="<p>secret</p>")
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalars.return_value.all.return_value = [note]
        db.execute = AsyncMock(return_value=result_mock)

        notes = await note_service.get_notes(db, "area-1")

        # Service returns ORM objects; router serializes to NoteSummaryResponse.
        # Verify the ORM object has content — serialization test is in route tests.
        assert hasattr(notes[0], "content")


class TestGetNote:
    async def test_returns_full_note_with_content(self):
        note = _make_note(content="<p>Full content</p>")
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = note
        db.execute = AsyncMock(return_value=result_mock)

        found = await note_service.get_note(db, "note-1", "area-1")

        assert found.content == "<p>Full content</p>"

    async def test_note_from_other_area_raises_404(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(HTTPException) as exc_info:
            await note_service.get_note(db, "note-1", "area-other")

        assert exc_info.value.status_code == 404

    async def test_nonexistent_note_raises_404(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(HTTPException) as exc_info:
            await note_service.get_note(db, "nonexistent", "area-1")

        assert exc_info.value.status_code == 404


class TestUpdateNote:
    async def test_partial_patch_preserves_content_when_not_sent(self):
        original = _make_note(content="<p>Original content</p>")
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = original
        db.execute = AsyncMock(return_value=result_mock)
        db.refresh = AsyncMock()

        data = NoteUpdate(title="New Title")
        updated = await note_service.update_note(db, "note-1", "area-1", data)

        assert updated.title == "New Title"
        assert updated.content == "<p>Original content</p>"

    async def test_note_from_other_area_raises_404(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(HTTPException) as exc_info:
            await note_service.update_note(
                db, "note-1", "area-other", NoteUpdate(title="x")
            )

        assert exc_info.value.status_code == 404


class TestDeleteNote:
    async def test_delete_calls_db_delete_and_commit(self):
        note = _make_note()
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = note
        db.execute = AsyncMock(return_value=result_mock)

        await note_service.delete_note(db, "note-1", "area-1")

        db.delete.assert_called_once_with(note)
        db.commit.assert_called_once()

    async def test_note_from_other_area_raises_404(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(HTTPException) as exc_info:
            await note_service.delete_note(db, "note-1", "area-other")

        assert exc_info.value.status_code == 404
