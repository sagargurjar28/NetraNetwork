import uuid
from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.config import Base


class InvestigationBoard(Base):
    __tablename__ = "investigation_boards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    pins = relationship("BoardPin", back_populates="board", cascade="all, delete-orphan")
    connections = relationship(
        "BoardConnection", back_populates="board", cascade="all, delete-orphan"
    )


class BoardPin(Base):
    __tablename__ = "board_pins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    board_id = Column(
        UUID(as_uuid=True),
        ForeignKey("investigation_boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    entity_type = Column(String(50), nullable=False)
    label = Column(String(255), nullable=False)
    content = Column(JSON, nullable=True)
    position_x = Column(Float, default=0.0)
    position_y = Column(Float, default=0.0)
    color = Column(String(20), default="#1f77b4")
    created_by = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    board = relationship("InvestigationBoard", back_populates="pins")


class BoardConnection(Base):
    __tablename__ = "board_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    board_id = Column(
        UUID(as_uuid=True),
        ForeignKey("investigation_boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_pin_id = Column(
        UUID(as_uuid=True), ForeignKey("board_pins.id", ondelete="CASCADE"), nullable=False
    )
    target_pin_id = Column(
        UUID(as_uuid=True), ForeignKey("board_pins.id", ondelete="CASCADE"), nullable=False
    )
    label = Column(String(255), nullable=True)
    confidence = Column(Float, default=1.0)
    notes = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    board = relationship("InvestigationBoard", back_populates="connections")
