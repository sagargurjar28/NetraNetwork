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
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_permission("manage_users")),
) -> dict[str, Any]:
    """Push pins and connections from Postgres to Neo4j in batches.

    Call repeatedly with increasing offset until `done: true`.
    Batched to stay under Railway's request timeout.
    """
    from app.models.board import InvestigationBoard, BoardPin, BoardConnection
    from app.services import graph_service

    total_pins: int = db.query(BoardPin).count()
    total_conns: int = db.query(BoardConnection).count()

    boards = db.query(InvestigationBoard).all()
    pins = db.query(BoardPin).offset(offset).limit(limit).all()
    conns = db.query(BoardConnection).offset(offset).limit(limit).all()

    synced_boards: int = 0
    synced_pins: int = 0
    synced_conns: int = 0
    failures: list[str] = []

    for board in boards:
        try:
            graph_service.sync_board(board.id, board.case_id, board.name)
            synced_boards += 1
        except Exception as e:
            failures.append(f"board {board.id}: {e}")

    for pin in pins:
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

    for conn in conns:
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

    next_offset: int = offset + limit
    done: bool = next_offset >= max(total_pins, total_conns)

    return {
        "offset": offset,
        "limit": limit,
        "total_pins": total_pins,
        "total_connections": total_conns,
        "boards_synced": synced_boards,
        "pins_synced": synced_pins,
        "connections_synced": synced_conns,
        "failures": failures[:20],
        "next_offset": next_offset if not done else None,
        "done": done,
    }