from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import get_db
from app.core.security import CurrentUser, get_current_user
from app.models.board import BoardConnection, BoardPin
from app.models.case import Case

router: APIRouter = APIRouter(prefix="/api/network", tags=["network"])


@router.get("/stats")
def network_stats(
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
) -> dict[str, int]:
    active_cases: int = db.query(func.count(Case.id)).scalar() or 0
    entities: int = db.query(func.count(BoardPin.id)).scalar() or 0
    links: int = db.query(func.count(BoardConnection.id)).scalar() or 0
    high_risk: int = (
        db.query(func.count(BoardPin.id))
        .filter(BoardPin.entity_type == "person")
        .scalar()
        or 0
    )
    return {
        "activeCases": active_cases,
        "entitiesTracked": entities,
        "linksDiscovered": links,
        "highRiskFlags": high_risk,
    }


@router.get("/entities")
def list_entities(
    q: str = Query("", min_length=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
) -> list[dict[str, Any]]:
    query = db.query(BoardPin)
    if q:
        query = query.filter(BoardPin.label.ilike(f"%{q}%"))
    pins: list[BoardPin] = query.limit(limit).all()
    return [
        {
            "id": str(p.id),
            "name": p.label,
            "type": p.entity_type,
            "boardId": str(p.board_id),
            "color": p.color,
            "x": p.position_x,
            "y": p.position_y,
        }
        for p in pins
    ]


@router.get("/cases")
def list_cases_network(
    q: str = Query("", min_length=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(get_current_user),
) -> list[dict[str, Any]]:
    query = db.query(Case)
    if q:
        query = query.filter(Case.title.ilike(f"%{q}%"))
    cases: list[Case] = query.limit(limit).all()
    return [
        {
            "id": str(c.id),
            "title": c.title,
            "status": c.status,
            "description": c.description,
            "createdAt": c.created_at.isoformat() if c.created_at else None,
        }
        for c in cases
    ]


@router.get("/graph")
def network_graph(
    _: CurrentUser = Depends(get_current_user),
) -> dict[str, list[Any]]:
    return {"nodes": [], "edges": []}


@router.get("/relations")
def network_relations(
    _: CurrentUser = Depends(get_current_user),
) -> list[Any]:
    return []
