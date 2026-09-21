from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PinBase(BaseModel):
    entity_id: UUID | None = None
    entity_type: str
    label: str
    content: dict[str, Any] | None = None
    position_x: float = 0.0
    position_y: float = 0.0
    color: str = "#1f77b4"


class PinCreate(PinBase):
    pass


class PinRead(PinBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    board_id: UUID
    created_by: UUID
    created_at: datetime


class ConnectionBase(BaseModel):
    source_pin_id: UUID
    target_pin_id: UUID
    label: str | None = None
    confidence: float = 1.0
    notes: str | None = None


class ConnectionCreate(ConnectionBase):
    pass


class ConnectionRead(ConnectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    board_id: UUID
    created_by: UUID
    created_at: datetime


class BoardBase(BaseModel):
    name: str
    description: str | None = None


class BoardCreate(BoardBase):
    case_id: UUID


class BoardRead(BoardBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    case_id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime


class BoardDetail(BoardRead):
    pins: list[PinRead] = []
    connections: list[ConnectionRead] = []


class SuggestLinksRequest(BaseModel):
    board_id: UUID


class Suggestion(BaseModel):
    source_pin_id: UUID
    source_label: str
    target_pin_id: UUID
    target_label: str
    relationship: str = Field(default="ASSOCIATED_WITH")
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str


class SuggestLinksResponse(BaseModel):
    board_id: UUID
    suggestions: list[Suggestion] = []
