from datetime import datetime
from uuid import uuid4

from sqlalchemy import ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid4())
    )
    title: Mapped[str] = mapped_column(String(200))
    # SECURITY: HTML content from Tiptap — sanitize on frontend, store as-is server-side
    content: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        default=func.now(), onupdate=func.now()
    )

    area_id: Mapped[str] = mapped_column(
        String, ForeignKey("areas.id", ondelete="CASCADE"), index=True
    )
    area: Mapped["Area"] = relationship(back_populates="notes")  # noqa: F821
