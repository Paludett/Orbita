from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.models.area import Area
from app.schemas.area import AreaCreate, AreaUpdate
from app.services import area_service


def _make_area(area_id: str = "area-1", user_id: str = "user-1") -> Area:
    area = Area()
    area.id = area_id
    area.name = "Work"
    area.color = "#6C63FF"
    area.icon = "briefcase"
    area.order = 0
    area.user_id = user_id
    area.created_at = datetime(2026, 1, 1)
    area.updated_at = datetime(2026, 1, 1)
    return area


def _mock_db() -> AsyncMock:
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.delete = AsyncMock()
    return db


class TestGetAreas:
    async def test_returns_only_authed_user_areas(self):
        user_area = _make_area(area_id="a1", user_id="user-1")
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalars.return_value.all.return_value = [user_area]
        db.execute = AsyncMock(return_value=result_mock)

        areas = await area_service.get_areas(db, "user-1")

        assert len(areas) == 1
        assert areas[0].user_id == "user-1"

    async def test_returns_empty_when_no_areas(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalars.return_value.all.return_value = []
        db.execute = AsyncMock(return_value=result_mock)

        areas = await area_service.get_areas(db, "user-1")

        assert areas == []


class TestGetArea:
    async def test_found_area_returns_area(self):
        area = _make_area()
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = area
        db.execute = AsyncMock(return_value=result_mock)

        found = await area_service.get_area(db, "area-1", "user-1")

        assert found.id == "area-1"

    async def test_other_user_area_raises_404(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(HTTPException) as exc_info:
            await area_service.get_area(db, "area-1", "user-other")

        assert exc_info.value.status_code == 404

    async def test_nonexistent_area_raises_404(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(HTTPException) as exc_info:
            await area_service.get_area(db, "nonexistent", "user-1")

        assert exc_info.value.status_code == 404


class TestCreateArea:
    async def test_user_id_comes_from_token_not_body(self):
        db = _mock_db()

        created_area = _make_area(user_id="user-from-token")

        async def fake_refresh(obj):
            obj.id = created_area.id
            obj.user_id = created_area.user_id
            obj.created_at = created_area.created_at
            obj.updated_at = created_area.updated_at

        db.refresh = AsyncMock(side_effect=fake_refresh)

        data = AreaCreate(name="Work", color="#6C63FF", icon="briefcase")
        area = await area_service.create_area(db, "user-from-token", data)

        assert area.user_id == "user-from-token"
        db.add.assert_called_once()
        added_area = db.add.call_args[0][0]
        assert added_area.user_id == "user-from-token"

    async def test_create_area_commits_and_refreshes(self):
        db = _mock_db()

        async def fake_refresh(obj):
            obj.id = "new-id"
            obj.created_at = datetime(2026, 1, 1)
            obj.updated_at = datetime(2026, 1, 1)

        db.refresh = AsyncMock(side_effect=fake_refresh)

        data = AreaCreate(name="Study", color="#FF0000", icon="book", order=1)
        area = await area_service.create_area(db, "user-1", data)

        db.commit.assert_called_once()
        db.refresh.assert_called_once()
        assert area.name == "Study"
        assert area.order == 1


class TestUpdateArea:
    async def test_updates_only_fields_in_body(self):
        original = _make_area()
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = original
        db.execute = AsyncMock(return_value=result_mock)

        async def fake_refresh(obj):
            pass

        db.refresh = AsyncMock(side_effect=fake_refresh)

        data = AreaUpdate(name="Personal")
        updated = await area_service.update_area(db, "area-1", "user-1", data)

        assert updated.name == "Personal"
        assert updated.color == "#6C63FF"
        assert updated.icon == "briefcase"

    async def test_ownership_verified_before_update(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        data = AreaUpdate(name="Hacked")
        with pytest.raises(HTTPException) as exc_info:
            await area_service.update_area(db, "area-1", "attacker", data)

        assert exc_info.value.status_code == 404


class TestDeleteArea:
    async def test_ownership_verified_before_delete(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(HTTPException) as exc_info:
            await area_service.delete_area(db, "area-1", "attacker")

        assert exc_info.value.status_code == 404

    async def test_delete_calls_db_delete_and_commit(self):
        area = _make_area()
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = area
        db.execute = AsyncMock(return_value=result_mock)

        await area_service.delete_area(db, "area-1", "user-1")

        db.delete.assert_called_once_with(area)
        db.commit.assert_called_once()
