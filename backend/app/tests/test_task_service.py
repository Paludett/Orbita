from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.services import task_service


def _make_task(
    task_id: str = "task-1",
    area_id: str = "area-1",
    completed: bool = False,
    order: int = 0,
) -> Task:
    task = Task()
    task.id = task_id
    task.title = "Do something"
    task.description = None
    task.completed = completed
    task.due_date = None
    task.order = order
    task.area_id = area_id
    task.created_at = datetime(2026, 1, 1)
    task.updated_at = datetime(2026, 1, 1)
    return task


def _mock_db() -> AsyncMock:
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.delete = AsyncMock()
    return db


class TestGetTasks:
    async def test_returns_tasks_for_area(self):
        task = _make_task()
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalars.return_value.all.return_value = [task]
        db.execute = AsyncMock(return_value=result_mock)

        tasks = await task_service.get_tasks(db, "area-1")

        assert len(tasks) == 1
        assert tasks[0].area_id == "area-1"

    async def test_returns_empty_when_no_tasks(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalars.return_value.all.return_value = []
        db.execute = AsyncMock(return_value=result_mock)

        tasks = await task_service.get_tasks(db, "area-1")

        assert tasks == []


class TestGetTask:
    async def test_found_task_returns_task(self):
        task = _make_task()
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = task
        db.execute = AsyncMock(return_value=result_mock)

        found = await task_service.get_task(db, "task-1", "area-1")

        assert found.id == "task-1"

    async def test_task_from_other_area_raises_404(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(HTTPException) as exc_info:
            await task_service.get_task(db, "task-1", "area-other")

        assert exc_info.value.status_code == 404

    async def test_nonexistent_task_raises_404(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(HTTPException) as exc_info:
            await task_service.get_task(db, "nonexistent", "area-1")

        assert exc_info.value.status_code == 404


class TestCreateTask:
    async def test_area_id_comes_from_path_not_body(self):
        db = _mock_db()
        created = _make_task(area_id="area-from-path")

        async def fake_refresh(obj):
            obj.id = created.id
            obj.area_id = created.area_id
            obj.created_at = created.created_at
            obj.updated_at = created.updated_at

        db.refresh = AsyncMock(side_effect=fake_refresh)

        data = TaskCreate(title="Buy milk")
        task = await task_service.create_task(db, "area-from-path", data)

        assert task.area_id == "area-from-path"
        db.add.assert_called_once()
        added = db.add.call_args[0][0]
        assert added.area_id == "area-from-path"


class TestUpdateTask:
    async def test_partial_patch_does_not_overwrite_unset_fields(self):
        original = _make_task()
        original.due_date = datetime(2026, 12, 31)
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = original
        db.execute = AsyncMock(return_value=result_mock)
        db.refresh = AsyncMock()

        data = TaskUpdate(title="Updated title")
        updated = await task_service.update_task(db, "task-1", "area-1", data)

        assert updated.title == "Updated title"
        assert updated.due_date == datetime(2026, 12, 31)


class TestToggleTask:
    async def test_toggle_false_to_true(self):
        task = _make_task(completed=False)
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = task
        db.execute = AsyncMock(return_value=result_mock)
        db.refresh = AsyncMock()

        toggled = await task_service.toggle_task(db, "task-1", "area-1")

        assert toggled.completed is True

    async def test_toggle_true_to_false(self):
        task = _make_task(completed=True)
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = task
        db.execute = AsyncMock(return_value=result_mock)
        db.refresh = AsyncMock()

        toggled = await task_service.toggle_task(db, "task-1", "area-1")

        assert toggled.completed is False


class TestDeleteTask:
    async def test_delete_calls_db_delete_and_commit(self):
        task = _make_task()
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = task
        db.execute = AsyncMock(return_value=result_mock)

        await task_service.delete_task(db, "task-1", "area-1")

        db.delete.assert_called_once_with(task)
        db.commit.assert_called_once()

    async def test_task_from_other_area_raises_404(self):
        db = _mock_db()
        result_mock = MagicMock()
        result_mock.scalar_one_or_none.return_value = None
        db.execute = AsyncMock(return_value=result_mock)

        with pytest.raises(HTTPException) as exc_info:
            await task_service.delete_task(db, "task-1", "area-other")

        assert exc_info.value.status_code == 404
