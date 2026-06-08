from datetime import datetime

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    due_date: datetime | None = None
    order: int = 0


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    due_date: datetime | None = None
    order: int | None = None
    completed: bool | None = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: str | None
    completed: bool
    due_date: datetime | None
    order: int
    area_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
