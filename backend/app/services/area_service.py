from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.area import Area
from app.schemas.area import AreaCreate, AreaUpdate


async def get_areas(db: AsyncSession, user_id: str) -> list[Area]:
    # SECURITY: IDOR prevention — filter always includes user_id
    stmt = (
        select(Area)
        .where(Area.user_id == user_id)
        .order_by(Area.order.asc(), Area.created_at.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_area(db: AsyncSession, area_id: str, user_id: str) -> Area:
    # SECURITY: IDOR prevention — both area_id and user_id required
    stmt = select(Area).where(Area.id == area_id, Area.user_id == user_id)
    result = await db.execute(stmt)
    area = result.scalar_one_or_none()
    if area is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Area not found"
        )
    return area


async def create_area(db: AsyncSession, user_id: str, data: AreaCreate) -> Area:
    area = Area(
        name=data.name,
        color=data.color,
        icon=data.icon,
        order=data.order,
        user_id=user_id,
    )
    db.add(area)
    await db.commit()
    await db.refresh(area)
    return area


async def update_area(
    db: AsyncSession, area_id: str, user_id: str, data: AreaUpdate
) -> Area:
    area = await get_area(db, area_id, user_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(area, field, value)
    await db.commit()
    await db.refresh(area)
    return area


async def delete_area(db: AsyncSession, area_id: str, user_id: str) -> None:
    area = await get_area(db, area_id, user_id)
    await db.delete(area)
    await db.commit()
