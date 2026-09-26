"""
Seed a realistic multi-city criminal network scenario for SIH demo.
Safe to run multiple times — dedupes by label.
"""
import uuid
from sqlalchemy.orm import Session
from app.core.config import SessionLocal, Base, engine
from app.models.user import User
from app.models.case import Case
from app.models.board import InvestigationBoard, BoardPin, BoardConnection
from app.services import graph_service

# Deterministic IDs so the demo is reproducible
DEMO_CASE_ID  = uuid.UUID("11111111-1111-1111-1111-111111111111")
DEMO_BOARD_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")
ADMIN_ID      = uuid.UUID("33333333-3333-3333-3333-333333333333")


# ─── PINS ──────────────────────────────────────────────────────────────
PINS = [
    # (label, entity_type, color, x, y, content)
    # PEOPLE — suspects
    ("Arun Mehta",      "person", "#dc2626", 800,  100, {"role": "suspect", "location": "Dubai", "note": "Kingpin. Operates via burner."}),
    ("Vikram Singh",    "person", "#dc2626", 400,  200, {"role": "suspect", "location": "Mumbai", "note": "Distributor. Handles logistics."}),
    ("Priya Sharma",    "person", "#dc2626", 600,  400, {"role": "suspect", "location": "Gurgaon", "note": "Cybercrime head. Fake call center."}),
    ("Rahul Verma",     "person", "#dc2626", 200,  400, {"role": "suspect", "location": "Kochi", "note": "Supplies contraband."}),
    ("Anita Desai",     "person", "#dc2626", 800,  500, {"role": "suspect", "location": "Delhi", "note": "Shell company director."}),
    ("Karan Malhotra",  "person", "#6b7280", 1000, 300, {"role": "related", "location": "Delhi", "note": "Businessman. Under watch."}),
    ("Suresh Nair",     "person", "#dc2626", 500,  300, {"role": "suspect", "location": "Mumbai", "note": "Vikram's lieutenant."}),
    # PEOPLE — victims and witnesses
    ("Ravi Kumar",      "person", "#f59e0b", 300,  100, {"role": "victim",  "location": "Mumbai", "note": "Extortion complainant."}),
    ("Deepak Joshi",    "person", "#3b82f6", 150,  500, {"role": "witness", "location": "Kochi", "note": "Informer — port activity."}),
    ("Neha Gupta",      "person", "#f59e0b", 700,  600, {"role": "victim",  "location": "Pune", "note": "Cybercrime victim."}),

    # PHONES
    ("+91-99xxxx4444", "phone", "#f97316", 700,  50, {"owner": "Arun Mehta", "note": "Dubai burner"}),
    ("+91-96xxxx1111", "phone", "#f97316", 400,  300, {"owner": "Suresh Nair", "note": "Known associate"}),
    ("+91-97xxxx2222", "phone", "#f97316", 550,  350, {"owner": "Priya Sharma", "note": "Call center line"}),
    ("+91-98xxxx5555", "phone", "#f97316", 500,  400, {"owner": "Vikram Singh", "note": "Personal"}),
    ("+91-95xxxx3333", "phone", "#f97316", 950,  200, {"owner": "Karan Malhotra", "note": "Hidden burner"}),

    # LOCATIONS
    ("Mumbai Warehouse", "location", "#16a34a", 400,  150, {"note": "Storage hub"}),
    ("Kochi Port",       "location", "#16a34a", 100,  400, {"note": "Entry point"}),
    ("Gurgaon Center",   "location", "#16a34a", 600,  450, {"note": "Call center"}),
    ("Goa Resort",       "location", "#16a34a", 300,  500, {"note": "Neutral meeting spot"}),
    ("Delhi Office",     "location", "#16a34a", 900,  400, {"note": "Anita's shell company"}),

    # BANK ACCOUNTS
    ("HDFC A/c 1234",  "bankaccount", "#9333ea", 300,  650, {"note": "Primary hawala"}),
    ("SBI A/c 5678",   "bankaccount", "#9333ea", 500,  650, {"note": "Shell company"}),
    ("ICICI A/c 9012", "bankaccount", "#9333ea", 700,  700, {"note": "Priya's collection"}),
]


# ─── CONNECTIONS ──────────────────────────────────────────────────────
# (source_label, target_label, relationship, confidence, notes)
CONNECTIONS = [
    # Extortion case
    ("Ravi Kumar",     "+91-96xxxx1111", "CALLED", 0.95, "Threat calls — FIR ref"),
    ("Suresh Nair",    "+91-96xxxx1111", "OWNS",   1.00, "Registered owner"),

    # The Dubai hub
    ("Arun Mehta",     "+91-99xxxx4444", "OWNS",   1.00, "Registered owner"),
    ("Vikram Singh",   "+91-99xxxx4444", "CALLED", 0.90, "Weekly coordination"),
    ("Priya Sharma",   "+91-99xxxx4444", "CALLED", 0.90, "Weekly coordination"),
    ("+91-95xxxx3333", "+91-99xxxx4444", "CALLED", 0.85, "Hidden link"),

    # Mumbai cluster
    ("Vikram Singh",   "+91-98xxxx5555", "OWNS",   1.00, ""),
    ("Suresh Nair",    "+91-98xxxx5555", "CALLED", 0.85, "Daily"),
    ("Vikram Singh",   "Mumbai Warehouse", "LIVES_AT", 0.90, ""),
    ("Suresh Nair",    "Mumbai Warehouse", "ASSOCIATED_WITH", 0.85, ""),

    # Kochi cluster
    ("Rahul Verma",    "+91-98xxxx5555", "CALLED", 0.80, "Weekly"),
    ("Rahul Verma",    "Kochi Port",     "LIVES_AT", 0.90, ""),
    ("Deepak Joshi",   "Kochi Port",     "ASSOCIATED_WITH", 0.70, "Informer sighting"),

    # Gurgaon cluster
    ("Priya Sharma",   "+91-97xxxx2222", "OWNS",   1.00, ""),
    ("Priya Sharma",   "Gurgaon Center", "LIVES_AT", 0.90, ""),
    ("Suresh Nair",    "Gurgaon Center", "MET_WITH", 0.80, "Seen together"),
    ("Neha Gupta",     "+91-97xxxx2222", "CALLED", 0.75, "Victim's report"),

    # Hidden financer
    ("Karan Malhotra", "+91-95xxxx3333", "OWNS",   1.00, ""),
    ("Karan Malhotra", "Delhi Office",   "LIVES_AT", 0.85, ""),

    # Goa meeting
    ("Vikram Singh",   "Goa Resort",     "MET_WITH", 0.85, "Same week"),
    ("Rahul Verma",    "Goa Resort",     "MET_WITH", 0.85, "Same week"),

    # Financial circular flow
    ("HDFC A/c 1234",  "SBI A/c 5678",   "TRANSFERRED_TO", 0.95, "Rs 25L"),
    ("SBI A/c 5678",   "ICICI A/c 9012", "TRANSFERRED_TO", 0.95, "Rs 15L"),
    ("ICICI A/c 9012", "HDFC A/c 1234",  "TRANSFERRED_TO", 0.95, "Rs 10L"),
    ("Anita Desai",    "SBI A/c 5678",   "OWNS",   1.00, "Director"),
    ("Anita Desai",    "Delhi Office",   "LIVES_AT", 0.90, ""),

    # Loose ties (fuel for suggest-links)
    ("Vikram Singh",   "Priya Sharma",   "ASSOCIATED_WITH", 0.60, "Seen at airport"),
    ("Rahul Verma",    "Deepak Joshi",   "ASSOCIATED_WITH", 0.55, "Same village"),
]


def _get_or_create(session, model, **kwargs):
    obj = session.query(model).filter_by(**kwargs).first()
    if obj:
        return obj, False
    return model(**kwargs), True


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ─── Admin ─────────────────────────────────────────────────────────
    admin, created = _get_or_create(db, User, id=ADMIN_ID)
    if created:
        from passlib.context import CryptContext
        pwd = CryptContext(schemes=["bcrypt"])
        admin.username = "admin"
        admin.password_hash = pwd.hash("admin123")
        admin.role = "admin"
        db.add(admin)
        db.commit()
        print("Created admin user.")

    # ─── Case ──────────────────────────────────────────────────────────
    case, created = _get_or_create(db, Case, id=DEMO_CASE_ID)
    if created:
        case.title = "Operation Kaveri"
        case.description = "Multi-city narcotics + cybercrime + laundering network"
        case.status = "open"
        case.created_by = ADMIN_ID
        db.add(case)
        db.commit()
        print("Created case: Operation Kaveri")

    # ─── Board ─────────────────────────────────────────────────────────
    board, created = _get_or_create(db, InvestigationBoard, id=DEMO_BOARD_ID)
    if created:
        board.case_id = DEMO_CASE_ID
        board.name = "Operation Kaveri — Network Map"
        board.description = "Investigation board for the Kaveri network"
        board.created_by = ADMIN_ID
        db.add(board)
        db.commit()
        print("Created board.")

    # ─── Pins ──────────────────────────────────────────────────────────
    label_to_pin = {}
    new_pins = 0
    for label, etype, color, x, y, content in PINS:
        existing = (db.query(BoardPin)
                      .filter_by(board_id=DEMO_BOARD_ID, label=label)
                      .first())
        if existing:
            label_to_pin[label] = existing
            continue
        pin = BoardPin(
            board_id=DEMO_BOARD_ID,
            entity_type=etype,
            label=label,
            content=content,
            position_x=float(x),
            position_y=float(y),
            color=color,
            created_by=ADMIN_ID,
        )
        db.add(pin)
        db.flush()
        label_to_pin[label] = pin
        new_pins += 1

        try:
            graph_service.sync_pin(
                pin_id=pin.id, board_id=pin.board_id,
                entity_type=pin.entity_type, entity_id=pin.entity_id,
                label=pin.label, content=pin.content,
            )
        except Exception:
            pass

    db.commit()
    print(f"Created {new_pins} pins.")

    # ─── Connections ───────────────────────────────────────────────────
    new_connections = 0
    for src_label, tgt_label, rel, conf, notes in CONNECTIONS:
        src = label_to_pin.get(src_label)
        tgt = label_to_pin.get(tgt_label)
        if not src or not tgt:
            continue
        existing = (db.query(BoardConnection)
                      .filter_by(board_id=DEMO_BOARD_ID,
                                 source_pin_id=src.id,
                                 target_pin_id=tgt.id,
                                 label=rel)
                      .first())
        if existing:
            continue
        conn = BoardConnection(
            board_id=DEMO_BOARD_ID,
            source_pin_id=src.id,
            target_pin_id=tgt.id,
            label=rel,
            confidence=conf,
            notes=notes or None,
            created_by=ADMIN_ID,
        )
        db.add(conn)
        db.flush()
        new_connections += 1

        try:
            graph_service.sync_connection(
                connection_id=conn.id, board_id=conn.board_id,
                source_pin_id=conn.source_pin_id, target_pin_id=conn.target_pin_id,
                label=conn.label, confidence=conn.confidence, notes=conn.notes,
            )
        except Exception:
            pass

    db.commit()
    db.close()

    print(f"Created {new_connections} connections.")
    print(f"\n✓ Demo data ready.")
    print(f"  Case ID:  {DEMO_CASE_ID}")
    print(f"  Board ID: {DEMO_BOARD_ID}")
    print(f"  Login:    admin / admin123")


if __name__ == "__main__":
    seed()