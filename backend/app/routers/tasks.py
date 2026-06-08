from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import verify_area_ownership
from app.db.session import get_db
from app.models.area import Area
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services import task_service

router = APIRouter()


@router.get("/areas/{area_id}/tasks", response_model=list[TaskResponse])
async def list_tasks(
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    return await task_service.get_tasks(db, area.id)


@router.post(
    "/areas/{area_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_task(
    data: TaskCreate,
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    return await task_service.create_task(db, area.id, data)


@router.get("/areas/{area_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    return await task_service.get_task(db, task_id, area.id)


@router.patch("/areas/{area_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    data: TaskUpdate,
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    return await task_service.update_task(db, task_id, area.id, data)


@router.patch("/areas/{area_id}/tasks/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task(
    task_id: str,
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    return await task_service.toggle_task(db, task_id, area.id)


@router.delete(
    "/areas/{area_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_task(
    task_id: str,
    area: Area = Depends(verify_area_ownership),  # SECURITY: two-level ownership check
    db: AsyncSession = Depends(get_db),
):
    await task_service.delete_task(db, task_id, area.id)
