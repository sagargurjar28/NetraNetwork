"""
Bridges the NER extractor to the board.
On document upload: entities become pins; co-occurrence becomes connections.
"""
import sys
from pathlib import Path
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

_ML_ROOT: Path = Path(__file__).resolve().parents[3] / "ml-services"
if str(_ML_ROOT) not in sys.path:
    sys.path.insert(0, str(_ML_ROOT))

from nlp_extraction.extractor import extract_entities  # noqa: E402

from app.models.board import BoardPin, BoardConnection, InvestigationBoard
from app.services import graph_service


_KIND_MAP: dict[str, tuple[str, str]] = {
    "persons": ("person", "#1f77b4"),
    "phones": ("phone", "#ff7f0e"),
    "locations": ("location", "#2ca02c"),
    "amounts": ("note", "#9467bd"),
    "dates": ("note", "#8c564b"),
}


def extract_and_create_pins(
    db: Session,
    board: InvestigationBoard,
    text: str,
    document_id: UUID,
    user_id: UUID | str,
) -> dict[str, int]:
    """Extract entities from text and create pins. Never raises."""
    try:
        entities: dict[str, list[str]] = extract_entities(text)
        created: dict[str, int] = {"pins": 0, "connections": 0}

        existing: set[tuple[str, str]] = {
            (p.entity_type, p.label.strip().lower())
            for p in db.query(BoardPin).filter(BoardPin.board_id == board.id).all()
        }

        new_pins: list[BoardPin] = []

        for kind, values in entities.items():
            entity_type, color = _KIND_MAP.get(kind, ("note", "#7f7f7f"))
            for value in values:
                label: str = value[:120]
                key: tuple[str, str] = (entity_type, label.strip().lower())
                if key in existing:
                    continue
                existing.add(key)

                pin: BoardPin = BoardPin(
                    board_id=board.id,
                    entity_id=None,
                    entity_type=entity_type,
                    label=label,
                    content={"source_document_id": str(document_id)},
                    position_x=100.0 + (created["pins"] % 6) * 180.0,
                    position_y=100.0 + (created["pins"] // 6) * 160.0,
                    color=color,
                    created_by=user_id,
                )
                db.add(pin)
                new_pins.append(pin)
                created["pins"] += 1

        if not new_pins:
            return created

        db.commit()
        for pin in new_pins:
            db.refresh(pin)

        for pin in new_pins:
            try:
                graph_service.sync_pin(
                    pin_id=pin.id, board_id=pin.board_id,
                    entity_type=pin.entity_type, entity_id=pin.entity_id,
                    label=pin.label, content=pin.content,
                )
            except Exception:
                pass

        person_pins: list[BoardPin] = [p for p in new_pins if p.entity_type == "person"]
        phone_pins: list[BoardPin] = [p for p in new_pins if p.entity_type == "phone"]

        for pp in person_pins:
            for ph in phone_pins:
                try:
                    conn: BoardConnection = BoardConnection(
                        board_id=board.id,
                        source_pin_id=pp.id, target_pin_id=ph.id,
                        label="Associated with", confidence=0.5,
                        notes=f"Co-occurrence in document {document_id}",
                        created_by=user_id,
                    )
                    db.add(conn)
                    db.commit()
                    db.refresh(conn)
                    graph_service.sync_connection(
                        connection_id=conn.id, board_id=conn.board_id,
                        source_pin_id=conn.source_pin_id, target_pin_id=conn.target_pin_id,
                        label=conn.label, confidence=conn.confidence, notes=conn.notes,
                    )
                    created["connections"] += 1
                except Exception:
                    pass

        return created
    except Exception:
        return {"pins": 0, "connections": 0}
