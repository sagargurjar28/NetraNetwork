from typing import Any, Optional

from neo4j import GraphDatabase

from app.core.config import settings

_driver: Any = None


def _get_driver() -> Any:
    global _driver
    if _driver is None:
        _driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )
    return _driver


def retrieve_context(board_id: Optional[str], question: str) -> tuple[str, list[dict]]:
    """Return (context_text, citations). Stub: dumps all pins/connections on the board."""
    if not board_id:
        return ("", [])
    try:
        driver: Any = _get_driver()
        with driver.session() as session:
            result: Any = session.run(
                """
                MATCH (b:Board {id: $board_id})-[:HAS_PIN]->(p)
                OPTIONAL MATCH (p)-[r]->(m)
                WHERE r.board_id = $board_id
                RETURN p.id AS pid, p.label AS plabel, type(r) AS rel, m.id AS mid, m.label AS mlabel
                LIMIT 50
                """,
                board_id=board_id,
            )
            rows: list[dict] = [record.data() for record in result]
    except Exception:
        return ("", [])

    lines: list[str] = []
    citations: list[dict] = []
    seen_pins: set[Any] = set()
    for row in rows:
        if row["pid"] not in seen_pins:
            lines.append(f"- Pin: {row['plabel']} (id: {row['pid']})")
            citations.append({"type": "pin", "id": row["pid"], "label": row["plabel"]})
            seen_pins.add(row["pid"])
        if row["rel"] and row["mid"]:
            lines.append(f"  {row['plabel']} --{row['rel']}--> {row['mlabel']} (id: {row['mid']})")
            citations.append({"type": "connection", "id": row["mid"], "label": f"{row['plabel']} {row['rel']} {row['mlabel']}"})

    return ("\n".join(lines), citations)
