import re
from datetime import datetime

from pydantic import BaseModel, field_validator

_HEX_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


class AreaCreate(BaseModel):
    name: str
    color: str
    icon: str
    order: int = 0

    @field_validator("name")
    @classmethod
    def name_length(cls, v: str) -> str:
        if not (1 <= len(v) <= 100):
            raise ValueError("name must be 1-100 characters")
        return v

    @field_validator("icon")
    @classmethod
    def icon_length(cls, v: str) -> str:
        if not (1 <= len(v) <= 50):
            raise ValueError("icon must be 1-50 characters")
        return v

    @field_validator("color")
    @classmethod
    def color_hex(cls, v: str) -> str:
        if not _HEX_RE.match(v):
            raise ValueError("color must be a valid hex color (#RRGGBB)")
        return v


class AreaUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    icon: str | None = None
    order: int | None = None

    @field_validator("name")
    @classmethod
    def name_length(cls, v: str | None) -> str | None:
        if v is not None and not (1 <= len(v) <= 100):
            raise ValueError("name must be 1-100 characters")
        return v

    @field_validator("icon")
    @classmethod
    def icon_length(cls, v: str | None) -> str | None:
        if v is not None and not (1 <= len(v) <= 50):
            raise ValueError("icon must be 1-50 characters")
        return v

    @field_validator("color")
    @classmethod
    def color_hex(cls, v: str | None) -> str | None:
        if v is not None and not _HEX_RE.match(v):
            raise ValueError("color must be a valid hex color (#RRGGBB)")
        return v


class AreaResponse(BaseModel):
    id: str
    name: str
    color: str
    icon: str
    order: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
