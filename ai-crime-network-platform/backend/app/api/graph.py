from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import get_db
from app.core.security import CurrentUser, get_current_user
from app.models.board import InvestigationBoard
from app.services import graph_analytics_service

router: APIRouter = APIRouter(prefix="/api/graph", tags=["graph"])


class ShortestPathResponse(BaseModel):
    found: bool
    labels: list[str] = []
    ids: list[str] = []
    relationship_types: list[str] = []
    cost: float = 0.0


def _check_board(board_id: UUID, db: Session) -> None:
    board: InvestigationBoard | None = (
        db.query(InvestigationBoard).filter(InvestigationBoard.id == board_id).first()
    )
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Board not found"
        )


@router.get("/{board_id}/pagerank")
def pagerank(
    board_id: UUID,
    top_k: int = 10,
    db: Session = Depends(get_db),
    _user: CurrentUser = Depends(get_current_user),
) -> dict[str, Any]:
    _check_board(board_id, db)
    return {
        "board_id": str(board_id),
        "results": graph_analytics_service.get_pagerank(board_id, top_k),
    }


@router.get("/{board_id}/communities")
def communities(
    board_id: UUID,
    db: Session = Depends(get_db),
    _user: CurrentUser = Depends(get_current_user),
) -> dict[str, Any]:
    _check_board(board_id, db)
    return {
        "board_id": str(board_id),
        "communities": graph_analytics_service.get_communities(board_id),
    }


@router.get("/{board_id}/shortest-path", response_model=ShortestPathResponse)
def shortest_path(
    board_id: UUID,
    source: str = Query(...),
    target: str = Query(...),
    db: Session = Depends(get_db),
    _user: CurrentUser = Depends(get_current_user),
) -> dict[str, Any]:
    _check_board(board_id, db)
    return graph_analytics_service.get_shortest_path(board_id, source, target)
