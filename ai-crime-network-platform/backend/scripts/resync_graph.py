"""Re-push all pins and connections from Postgres to Neo4j.
Reports every failure explicitly — no silent swallowing."""
from app.core.config import SessionLocal
from app.models.board import InvestigationBoard, BoardPin, BoardConnection
from app.services import graph_service


def main():
    db = SessionLocal()

    boards = db.query(InvestigationBoard).all()
    print(f"Boards: {len(boards)}")
    for board in boards:
        try:
            graph_service.sync_board(board.id, board.case_id, board.name)
            print(f"  [OK] board {board.name}")
        except Exception as e:
            print(f"  [FAIL] board {board.name}: {type(e).__name__}: {e}")

    pins = db.query(BoardPin).all()
    print(f"\nPins: {len(pins)}")
    ok, fail = 0, 0
    for pin in pins:
        try:
            graph_service.sync_pin(
                pin_id=pin.id, board_id=pin.board_id,
                entity_type=pin.entity_type, entity_id=pin.entity_id,
                label=pin.label, content=pin.content,
            )
            ok += 1
        except Exception as e:
            fail += 1
            print(f"  [FAIL] pin '{pin.label}' ({pin.entity_type}): {type(e).__name__}: {e}")
    print(f"  pins synced: {ok}, failed: {fail}")

    conns = db.query(BoardConnection).all()
    print(f"\nConnections: {len(conns)}")
    ok, fail = 0, 0
    for conn in conns:
        try:
            graph_service.sync_connection(
                connection_id=conn.id, board_id=conn.board_id,
                source_pin_id=conn.source_pin_id, target_pin_id=conn.target_pin_id,
                label=conn.label, confidence=conn.confidence, notes=conn.notes,
            )
            ok += 1
        except Exception as e:
            fail += 1
            print(f"  [FAIL] conn '{conn.label}' {conn.source_pin_id}->{conn.target_pin_id}: {type(e).__name__}: {e}")
    print(f"  connections synced: {ok}, failed: {fail}")

    db.close()


if __name__ == "__main__":
    main()