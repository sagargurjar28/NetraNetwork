import uuid
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.config import Base


class Case(Base):
    __tablename__ = "cases"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: str = Column(String(255), nullable=False)
    description: str | None = Column(Text, nullable=True)
    status: str = Column(String(20), nullable=False, default="open")
    created_by: uuid.UUID = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
