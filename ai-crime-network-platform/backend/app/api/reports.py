from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_db
from app.core.security import CurrentUser, get_current_user
from app.models.board import BoardConnection, BoardPin, InvestigationBoard
from app.models.case import Case
from app.models.document import Document

router = APIRouter(prefix="/api", tags=["reports"])


@router.get("/cases/{case_id}/report/")
def case_report(
    case_id: UUID,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Return everything needed to render a case PDF report."""
    case: Case | None = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    boards: list[InvestigationBoard] = (
        db.query(InvestigationBoard)
        .filter(InvestigationBoard.case_id == case_id)
        .all()
    )
    board_ids: list[UUID] = [b.id for b in boards]

    pins: list[BoardPin] = (
        db.query(BoardPin).filter(BoardPin.board_id.in_(board_ids)).all()
        if board_ids
        else []
    )
    connections: list[BoardConnection] = (
        db.query(BoardConnection).filter(BoardConnection.board_id.in_(board_ids)).all()
        if board_ids
        else []
    )
    documents: list[Document] = (
        db.query(Document).filter(Document.case_id == case_id).all()
    )

    created_at = case.created_at
    return {
        "case": {
            "id": str(case.id),
            "title": case.title,
            "description": case.description,
            "status": case.status,
            "created_at": created_at.isoformat() if created_at else None,
        },
        "boards": [{"id": str(b.id), "name": b.name} for b in boards],
        "pins": [
            {
                "id": str(p.id),
                "board_id": str(p.board_id),
                "entity_type": p.entity_type,
                "label": p.label,
                "content": p.content,
                "position_x": p.position_x,
                "position_y": p.position_y,
                "color": p.color,
            }
            for p in pins
        ],
        "connections": [
            {
                "id": str(c.id),
                "board_id": str(c.board_id),
                "source_pin_id": str(c.source_pin_id),
                "target_pin_id": str(c.target_pin_id),
                "label": c.label,
                "confidence": c.confidence,
            }
            for c in connections
        ],
        "documents": [
            {
                "id": str(d.id),
                "filename": d.filename,
                "doc_hash": d.doc_hash,
                "ipfs_cid": d.ipfs_cid,
                "tx_hash": d.tx_hash,
            }
            for d in documents
        ],
        "summary": {
            "total_pins": len(pins),
            "total_connections": len(connections),
            "total_documents": len(documents),
            "persons": sum(1 for p in pins if p.entity_type == "person"),
            "phones": sum(1 for p in pins if p.entity_type == "phone"),
            "locations": sum(1 for p in pins if p.entity_type == "location"),
            "bank_accounts": sum(
                1 for p in pins if p.entity_type == "bankaccount"
            ),
        },
    }
