from datetime import datetime

from pydantic import BaseModel, Field


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = ""


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = None


class NoteSummaryResponse(BaseModel):
    id: str
    title: str
    updated_at: datetime

    model_config = {"from_attributes": True}


class NoteDetailResponse(BaseModel):
    id: str
    title: str
    content: str
    area_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
