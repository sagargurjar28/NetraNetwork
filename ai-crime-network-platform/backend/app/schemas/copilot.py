from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ChatRequest(BaseModel):
    conversation_id: UUID | None = None
    message: str
    board_id: UUID | None = None


class Citation(BaseModel):
    type: str
    id: str
    label: str


class ChatResponse(BaseModel):
    conversation_id: UUID
    answer: str
    citations: list[Citation] = []
    intent: str = "general"


class ConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str | None
    created_at: datetime


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role: str
    content: str
    citations: list[dict[str, Any]] | None = None
    intent: Optional[str] = None
    created_at: datetime


class ConversationDetail(BaseModel):
    id: UUID
    title: str | None
    created_at: datetime
    messages: list[MessageRead] = []
