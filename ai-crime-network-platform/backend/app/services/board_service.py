from uuid import UUID
from sqlalchemy.orm import Session
from app.models.board import InvestigationBoard, BoardPin, BoardConnection
from app.schemas.board import BoardCreate, PinCreate, ConnectionCreate

def create_board(db: Session, board: BoardCreate, user_id: UUID):
    db_board = InvestigationBoard(
        case_id=board.case_id,
        name=board.name,
        description=board.description,
        created_by=user_id
    )
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    return db_board

def get_boards_by_case(db: Session, case_id: UUID):
    return db.query(InvestigationBoard).filter(InvestigationBoard.case_id == case_id).all()

def get_board(db: Session, board_id: UUID):
    return db.query(InvestigationBoard).filter(InvestigationBoard.id == board_id).first()

def add_pin(db: Session, board_id: UUID, pin: PinCreate):
    db_pin = BoardPin(board_id=board_id, **pin.dict())
    db.add(db_pin)
    db.commit()
    db.refresh(db_pin)
    return db_pin

def add_connection(db: Session, board_id: UUID, conn: ConnectionCreate):
    db_conn = BoardConnection(board_id=board_id, **conn.dict())
    db.add(db_conn)
    db.commit()
    db.refresh(db_conn)
    return db_conn

def delete_pin(db: Session, board_id: UUID, pin_id: UUID):
    pin = db.query(BoardPin).filter(BoardPin.id == pin_id, BoardPin.board_id == board_id).first()
    if pin:
        db.delete(pin)
        db.commit()
    return pin