from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import get_db
from app.core.rbac import require_permission
from app.core.security import CurrentUser, get_current_user
from app.models.user import User

router: APIRouter = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_permission("manage_users")),
) -> list[dict[str, Any]]:
    users: list[User] = db.query(User).all()
    return [
        {
            "id": str(u.id),
            "username": u.username,
            "role": u.role,
            "createdAt": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.get("/audit")
def list_audit(
    _: CurrentUser = Depends(require_permission("manage_users")),
) -> list[Any]:
    return []


@router.get("/health")
def admin_health(
    _: CurrentUser = Depends(get_current_user),
) -> dict[str, str]:
    return {
        "backend": "ok",
        "copilot": "unknown",
        "neo4j": "unknown",
        "qdrant": "unknown",
    }

@router.post("/resync-graph")
def resync_graph(
    db: Session = Depends(get_db),
    _=Depends(require_permission("manage_users")),
):
    """Push all pins and connections from Postgres to Neo4j.
    Useful when Neo4j is empty but Postgres has data."""
    from app.models.board import InvestigationBoard, BoardPin, BoardConnection
    from app.services import graph_service

    synced_boards = 0
    synced_pins = 0
    synced_conns = 0
    failures: list[str] = []

    for board in db.query(InvestigationBoard).all():
        try:
            graph_service.sync_board(board.id, board.case_id, board.name)
            synced_boards += 1
        except Exception as e:
            failures.append(f"board {board.id}: {e}")

    for pin in db.query(BoardPin).all():
        try:
            graph_service.sync_pin(
                pin_id=pin.id,
                board_id=pin.board_id,
                entity_type=pin.entity_type,
                entity_id=pin.entity_id,
                label=pin.label,
                content=pin.content,
            )
            synced_pins += 1
        except Exception as e:
            failures.append(f"pin {pin.label}: {e}")

    for conn in db.query(BoardConnection).all():
        try:
            graph_service.sync_connection(
                connection_id=conn.id,
                board_id=conn.board_id,
                source_pin_id=conn.source_pin_id,
                target_pin_id=conn.target_pin_id,
                label=conn.label,
                confidence=conn.confidence,
                notes=conn.notes,
            )
            synced_conns += 1
        except Exception as e:
            failures.append(f"conn {conn.id}: {e}")

    return {
        "boards_synced": synced_boards,
        "pins_synced": synced_pins,
        "connections_synced": synced_conns,
        "failures": failures[:20],
    }