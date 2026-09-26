from typing import Any, Optional
from uuid import UUID
import json

from app.core.config import get_neo4j_driver

ALLOWED_LABELS: set[str] = {
    "person",
    "phone",
    "location",
    "document",
    "note",
    "case",
    "fir",
    "bankaccount",
}

ALLOWED_RELS: set[str] = {
    "CALLED",
    "MET_WITH",
    "TRANSFERRED_TO",
    "LIVES_AT",
    "OWNS",
    "ASSOCIATED_WITH",
}


def _label_for(entity_type: str) -> str:
    normalized: str = entity_type.strip().lower()
    if normalized not in ALLOWED_LABELS:
        raise ValueError(f"Unsupported entity_type: {entity_type}")
    return normalized.capitalize()


def _rel_type(label: str | None) -> str:
    if not label:
        return "ASSOCIATED_WITH"
    normalized: str = label.strip().upper().replace(" ", "_").replace("-", "_")
    if normalized in ALLOWED_RELS:
        return normalized
    return "ASSOCIATED_WITH"


def _run(query: str, **params: Any) -> list[dict[str, Any]]:
    driver = get_neo4j_driver()
    with driver.session() as session:
        result = session.run(query, **params)
        return [record.data() for record in result]


def sync_board(board_id: UUID | str, case_id: UUID | str, name: str) -> None:
    _run(
        "MERGE (b:Board {id: $board_id}) "
        "SET b.board_id = $board_id, b.name = $name, b.case_id = $case_id "
        "MERGE (c:Case {id: $case_id}) "
        "SET c.case_id = $case_id "
        "MERGE (b)-[:FOR_CASE]->(c)",
        board_id=str(board_id),
        case_id=str(case_id),
        name=name,
    )


def delete_board(board_id: UUID | str) -> None:
    _run(
        "MATCH (b:Board {id: $board_id}) DETACH DELETE b",
        board_id=str(board_id),
    )


def sync_pin(
    pin_id: UUID,
    board_id: UUID,
    entity_type: str,
    entity_id: Optional[UUID],
    label: str,
    content: Optional[dict],
) -> None:
    node_label = _label_for(entity_type)
    _run(
        f"""
        MERGE (b:Board {{id: $board_id}})
        MERGE (n:{node_label} {{id: $pin_id}})
        SET n.label = $label,
            n.entity_id = $entity_id,
            n.content = $content
        MERGE (b)-[:HAS_PIN]->(n)
        """,
        board_id=str(board_id),
        pin_id=str(pin_id),
        entity_id=str(entity_id) if entity_id else None,
        label=label,
        content=json.dumps(content) if content else None,
    )


def delete_pin(pin_id: UUID | str) -> None:
    _run(
        "MATCH (n {id: $pin_id}) DETACH DELETE n",
        pin_id=str(pin_id),
    )


def sync_connection(
    connection_id: UUID | str,
    board_id: UUID | str,
    source_pin_id: UUID | str,
    target_pin_id: UUID | str,
    label: str | None,
    confidence: float,
    notes: str | None,
) -> None:
    rel: str = _rel_type(label)
    _run(
        f"MATCH (a {{id: $source_pin_id}}), (t {{id: $target_pin_id}}) "
        f"MERGE (a)-[r:{rel} {{id: $connection_id}}]->(t) "
        "SET r.board_id = $board_id, r.label = $label, "
        "r.confidence = $confidence, r.notes = $notes",
        connection_id=str(connection_id),
        board_id=str(board_id),
        source_pin_id=str(source_pin_id),
        target_pin_id=str(target_pin_id),
        label=label,
        confidence=confidence,
        notes=notes,
    )


def delete_connection(connection_id: UUID | str) -> None:
    _run(
        "MATCH ()-[r {id: $connection_id}]->() DELETE r",
        connection_id=str(connection_id),
    )


def get_board_graph(board_id: UUID | str) -> dict[str, list[dict[str, Any]]]:
    nodes: list[dict[str, Any]] = _run(
        "MATCH (b:Board {id: $board_id})-[:HAS_PIN]->(n) RETURN n AS node",
        board_id=str(board_id),
    )
    relationships: list[dict[str, Any]] = _run(
        "MATCH (a)-[r]->(c) WHERE r.board_id = $board_id RETURN r AS rel",
        board_id=str(board_id),
    )
    return {"nodes": nodes, "relationships": relationships}


def find_common_neighbours(
    pin_id: UUID | str, board_id: UUID | str
) -> list[dict[str, Any]]:
    return _run(
        "MATCH (b:Board {id: $board_id})-[:HAS_PIN]->(p), "
        "(b)-[:HAS_PIN]->(other), "
        "(p)--(common)--(other) "
        "WHERE p.id = $pin_id AND other.id <> $pin_id "
        "RETURN DISTINCT other AS neighbour, common AS via",
        pin_id=str(pin_id),
        board_id=str(board_id),
    )


_SHARED_WEIGHTS: dict[str, float] = {
    "BankAccount": 0.90,
    "Phone": 0.85,
    "Document": 0.75,
    "Location": 0.70,
    "Person": 0.60,
    "Case": 0.50,
    "Fir": 0.55,
    "Note": 0.30,
}

_CONFIDENCE_FLOOR: float = 0.30


def suggest_links(
    board_id: UUID | str, limit: int = 100
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = _run(
        "MATCH (b:Board {id: $board_id})-[:HAS_PIN]->(p1), "
        "(b)-[:HAS_PIN]->(p2), "
        "(p1)-[r1]-(shared)-[r2]-(p2) "
        "WHERE p1.id < p2.id "
        "AND type(r1) <> 'HAS_PIN' AND type(r1) <> 'FOR_CASE' "
        "AND type(r2) <> 'HAS_PIN' AND type(r2) <> 'FOR_CASE' "
        "AND NOT (p1)--(p2) "
        "RETURN DISTINCT p1.id AS source_pin_id, p1.label AS source_label, "
        "p2.id AS target_pin_id, p2.label AS target_label, "
        "labels(shared)[0] AS shared_type, "
        "coalesce(shared.label, shared.id) AS shared_label, "
        "type(r1) AS rel1, type(r2) AS rel2 "
        "LIMIT $limit",
        board_id=str(board_id),
        limit=limit,
    )
    suggestions: list[dict[str, Any]] = []
    for row in rows:
        shared_type: str = str(row.get("shared_type", ""))
        shared_label: str = str(row.get("shared_label", ""))
        rel1: str = str(row.get("rel1", ""))
        rel2: str = str(row.get("rel2", ""))
        confidence: float = _SHARED_WEIGHTS.get(shared_type, _CONFIDENCE_FLOOR)
        if rel1 == rel2:
            confidence = min(1.0, confidence + 0.05)
        relationship: str = (
            rel1 if rel1 == rel2 and rel1 in ALLOWED_RELS else "ASSOCIATED_WITH"
        )
        reason: str = f"Both linked to same {shared_type.lower()}: {shared_label}"
        suggestions.append(
            {
                "source_pin_id": row.get("source_pin_id"),
                "source_label": row.get("source_label"),
                "target_pin_id": row.get("target_pin_id"),
                "target_label": row.get("target_label"),
                "relationship": relationship,
                "confidence": confidence,
                "reason": reason,
            }
        )
    suggestions.sort(key=lambda item: item["confidence"], reverse=True)
    return suggestions
