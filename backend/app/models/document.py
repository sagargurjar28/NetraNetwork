import uuid
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.config import Base


class Document(Base):
    __tablename__ = "documents"

    id: uuid.UUID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: uuid.UUID = Column(
        UUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    filename: str = Column(String(255), nullable=False)
    ipfs_cid: str | None = Column(String(255), nullable=True)
    doc_hash: str = Column(String(128), nullable=False)
    tx_hash: str | None = Column(String(128), nullable=True)
    uploaded_by: uuid.UUID = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
