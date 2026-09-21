from typing import Any, Optional

from neo4j import GraphDatabase

from app.core.config import settings
from app.rag.router import Intent, classify_intent

_driver: Any = None


def _get_driver() -> Any:
    global _driver
    if _driver is None:
        _driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )
    return _driver


def _graph_context(board_id: str, question: str) -> tuple[str, list[dict]]:
    """Fetch pins and connections for the board."""
    driver: Any = _get_driver()
    with driver.session() as session:
        result: Any = session.run(
            """
            MATCH (b:Board {id: $board_id})-[:HAS_PIN]->(p)
            OPTIONAL MATCH (p)-[r]->(m)
            WHERE r.board_id = $board_id
            RETURN p.id AS pid, p.label AS plabel, type(r) AS rel,
                   m.id AS mid, m.label AS mlabel
            LIMIT 50
            """,
            board_id=board_id,
        )
        rows: list[dict] = [record.data() for record in result]

    lines: list[str] = []
    citations: list[dict] = []
    seen_pins: set[Any] = set()
    for row in rows:
        if row["pid"] not in seen_pins:
            lines.append(f"- Pin: {row['plabel']} (id: {row['pid']})")
            citations.append({"type": "pin", "id": row["pid"], "label": row["plabel"]})
            seen_pins.add(row["pid"])
        if row["rel"] and row["mid"]:
            lines.append(
                f"  {row['plabel']} --{row['rel']}--> {row['mlabel']} (id: {row['mid']})"
            )
            citations.append({
                "type": "connection",
                "id": row["mid"],
                "label": f"{row['plabel']} {row['rel']} {row['mlabel']}",
            })

    return ("\n".join(lines), citations)


def _vector_context(board_id: str, question: str) -> tuple[str, list[dict]]:
    """Placeholder for Phase E.2 (Qdrant). Falls back to graph for now."""
    return _graph_context(board_id, question)


def _summary_context(board_id: str, question: str) -> tuple[str, list[dict]]:
    """Same as graph for now — the LLM does the summarizing."""
    return _graph_context(board_id, question)


def retrieve_context(
    board_id: Optional[str],
    question: str,
) -> tuple[str, list[dict], str]:
    """
    Classify intent, dispatch to the right retrieval strategy.
    Returns (context_text, citations, intent_value).
    """
    intent: Intent = classify_intent(question)

    if not board_id:
        return ("", [], intent.value)

    try:
        if intent == Intent.GRAPH:
            ctx, cites = _graph_context(board_id, question)
        elif intent == Intent.VECTOR:
            ctx, cites = _vector_context(board_id, question)
        elif intent == Intent.SUMMARY:
            ctx, cites = _summary_context(board_id, question)
        else:
            ctx, cites = ("", [])
    except Exception:
        ctx, cites = ("", [])

    return (ctx, cites, intent.value)
