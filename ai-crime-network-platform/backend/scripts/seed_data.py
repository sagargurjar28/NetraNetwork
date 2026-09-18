"""Seed a demo board, pins, and connections. Idempotent — safe to run twice."""
import uuid
from app.core.config import SessionLocal, Base, engine
from app.models.board import InvestigationBoard, BoardPin, BoardConnection

# Fixed UUIDs so Pranjal and Parag can hardcode them in the frontend.
DEMO_CASE_ID  = uuid.UUID("11111111-1111-1111-1111-111111111111")
DEMO_BOARD_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")
DEMO_ADMIN_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")  # any UUID; FK not yet enforced

RAVI   = uuid.UUID("44444444-4444-4444-4444-444444444444")
SURESH = uuid.UUID("55555555-5555-5555-5555-555555555555")
PHONE  = uuid.UUID("66666666-6666-6666-6666-666666666666")
CONN1  = uuid.UUID("77777777-7777-7777-7777-777777777777")
CONN2  = uuid.UUID("88888888-8888-8888-8888-888888888888")


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if not db.query(InvestigationBoard).filter_by(id=DEMO_BOARD_ID).first():
        db.add(InvestigationBoard(
            id=DEMO_BOARD_ID,
            case_id=DEMO_CASE_ID,
            name="Case 101 – Suspect Network",
            description="Demo board for frontend development",
            created_by=DEMO_ADMIN_ID,
        ))
        db.commit()
        print("Board created.")

    pins = [
        (RAVI,   "person", "Ravi Kumar",      100.0, 100.0),
        (SURESH, "person", "Suresh Nair",     400.0, 100.0),
        (PHONE,  "phone",  "+91-98xxxx1111",  250.0, 300.0),
    ]
    for pid, etype, label, x, y in pins:
        if not db.query(BoardPin).filter_by(id=pid).first():
            db.add(BoardPin(
                id=pid, board_id=DEMO_BOARD_ID,
                entity_type=etype, label=label,
                position_x=x, position_y=y,
                created_by=DEMO_ADMIN_ID,
            ))
    db.commit()

    conns = [
        (CONN1, RAVI,   PHONE, "Called"),
        (CONN2, SURESH, PHONE, "Called"),
    ]
    for cid, src, tgt, lbl in conns:
        if not db.query(BoardConnection).filter_by(id=cid).first():
            db.add(BoardConnection(
                id=cid, board_id=DEMO_BOARD_ID,
                source_pin_id=src, target_pin_id=tgt,
                label=lbl, confidence=0.9,
                created_by=DEMO_ADMIN_ID,
            ))
    db.commit()
    db.close()
    print("Seed complete. Board ID:", DEMO_BOARD_ID)


if __name__ == "__main__":
    seed()