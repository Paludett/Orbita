from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


async def get_tasks(db: AsyncSession, area_id: str) -> list[Task]:
    stmt = (
        select(Task)
        .where(Task.area_id == area_id)
        .order_by(Task.order.asc(), Task.created_at.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_task(db: AsyncSession, task_id: str, area_id: str) -> Task:
    # SECURITY: filter by task_id AND area_id to prevent IDOR between areas
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.area_id == area_id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return task


async def create_task(db: AsyncSession, area_id: str, data: TaskCreate) -> Task:
    task = Task(
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        order=data.order,
        area_id=area_id,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def update_task(
    db: AsyncSession, task_id: str, area_id: str, data: TaskUpdate
) -> Task:
    task = await get_task(db, task_id, area_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    await db.commit()
    await db.refresh(task)
    return task


async def toggle_task(db: AsyncSession, task_id: str, area_id: str) -> Task:
    task = await get_task(db, task_id, area_id)
    task.completed = not task.completed
    await db.commit()
    await db.refresh(task)
    return task


async def delete_task(db: AsyncSession, task_id: str, area_id: str) -> None:
    task = await get_task(db, task_id, area_id)
    await db.delete(task)
    await db.commit()
