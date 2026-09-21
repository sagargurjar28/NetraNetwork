from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CaseCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "open"


class CaseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str | None
    status: str
    created_by: UUID
    created_at: datetime
