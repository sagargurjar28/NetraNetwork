from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_db
from app.core.security import CurrentUser, get_current_user
from app.models.board import BoardConnection, BoardPin, InvestigationBoard
from app.services import graph_service
from app.schemas.board import (
    BoardCreate,
    BoardDetail,
    BoardRead,
    ConnectionCreate,
    ConnectionRead,
    PinCreate,
    PinRead,
    SuggestLinksRequest,
    SuggestLinksResponse,
    Suggestion,
)

router = APIRouter(prefix="/api", tags=["boards"])


@router.post("/boards/", response_model=BoardRead, status_code=status.HTTP_201_CREATED)
def create_board(
    payload: BoardCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> InvestigationBoard:
    board: InvestigationBoard = InvestigationBoard(
        case_id=payload.case_id,
        name=payload.name,
        description=payload.description,
        created_by=user.id,
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    try:
        graph_service.sync_board(board.id, board.case_id, board.name)
    except Exception:
        pass
    return board


@router.get("/cases/{case_id}/boards/", response_model=list[BoardRead])
def list_boards(
    case_id: UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> list[InvestigationBoard]:
    return (
        db.query(InvestigationBoard)
        .filter(InvestigationBoard.case_id == case_id)
        .all()
    )


@router.get("/boards/{board_id}/", response_model=BoardDetail)
def get_board(
    board_id: UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> InvestigationBoard:
    board: InvestigationBoard | None = (
        db.query(InvestigationBoard).filter(InvestigationBoard.id == board_id).first()
    )
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return board


@router.post(
    "/boards/{board_id}/pins/", response_model=PinRead, status_code=status.HTTP_201_CREATED
)
def add_pin(
    board_id: UUID,
    payload: PinCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> BoardPin:
    board: InvestigationBoard | None = (
        db.query(InvestigationBoard).filter(InvestigationBoard.id == board_id).first()
    )
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    pin: BoardPin = BoardPin(board_id=board_id, created_by=user.id, **payload.model_dump())
    db.add(pin)
    db.commit()
    db.refresh(pin)
    try:
        graph_service.sync_pin(
            pin.id, board_id, pin.entity_type, pin.entity_id, pin.label, pin.content
        )
    except Exception:
        pass
    return pin


@router.post(
    "/boards/{board_id}/connections/",
    response_model=ConnectionRead,
    status_code=status.HTTP_201_CREATED,
)
def add_connection(
    board_id: UUID,
    payload: ConnectionCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> BoardConnection:
    board: InvestigationBoard | None = (
        db.query(InvestigationBoard).filter(InvestigationBoard.id == board_id).first()
    )
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    pin_ids: set[UUID] = {payload.source_pin_id, payload.target_pin_id}
    found: int = (
        db.query(BoardPin)
        .filter(BoardPin.id.in_(pin_ids), BoardPin.board_id == board_id)
        .count()
    )
    if found != len(pin_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source or target pin not found on this board",
        )
    connection: BoardConnection = BoardConnection(
        board_id=board_id, created_by=user.id, **payload.model_dump()
    )
    db.add(connection)
    db.commit()
    db.refresh(connection)
    try:
        graph_service.sync_connection(
            connection.id,
            board_id,
            connection.source_pin_id,
            connection.target_pin_id,
            connection.label,
            connection.confidence,
            connection.notes,
        )
    except Exception:
        pass
    return connection


@router.delete("/boards/{board_id}/pins/{pin_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_pin(
    board_id: UUID,
    pin_id: UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> Response:
    pin: BoardPin | None = (
        db.query(BoardPin)
        .filter(BoardPin.id == pin_id, BoardPin.board_id == board_id)
        .first()
    )
    if pin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pin not found")
    db.delete(pin)
    db.commit()
    try:
        graph_service.delete_pin(pin.id)
    except Exception:
        pass
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/ai/suggest-links", response_model=SuggestLinksResponse)
def suggest_links(
    payload: SuggestLinksRequest,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> SuggestLinksResponse:
    board: InvestigationBoard | None = (
        db.query(InvestigationBoard)
        .filter(InvestigationBoard.id == payload.board_id)
        .first()
    )
    if board is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Board not found"
        )
    try:
        raw: list[dict[str, object]] = graph_service.suggest_links(payload.board_id)
    except Exception:
        raw = []
    return SuggestLinksResponse(
        board_id=payload.board_id,
        suggestions=[Suggestion(**s) for s in raw],
    )
