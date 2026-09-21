import uuid
from sqlalchemy import JSON, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.config import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: uuid.UUID = Column(UUID(as_uuid=True), nullable=False, index=True)
    title: str | None = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id: uuid.UUID = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: str = Column(String(20), nullable=False)
    content: str = Column(Text, nullable=False)
    citations: list[dict] | None = Column(JSON, nullable=True)
    intent: str | None = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
