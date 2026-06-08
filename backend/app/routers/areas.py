from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.area import AreaCreate, AreaResponse, AreaUpdate
from app.services import area_service

router = APIRouter()


@router.get("", response_model=list[AreaResponse])
async def list_areas(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AreaResponse]:
    return await area_service.get_areas(db, current_user.id)


@router.post("", response_model=AreaResponse, status_code=status.HTTP_201_CREATED)
async def create_area(
    data: AreaCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AreaResponse:
    return await area_service.create_area(db, current_user.id, data)


@router.get("/{area_id}", response_model=AreaResponse)
async def get_area(
    area_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AreaResponse:
    return await area_service.get_area(db, area_id, current_user.id)


@router.patch("/{area_id}", response_model=AreaResponse)
async def update_area(
    area_id: str,
    data: AreaUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AreaResponse:
    return await area_service.update_area(db, area_id, current_user.id, data)


@router.delete("/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_area(
    area_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await area_service.delete_area(db, area_id, current_user.id)
