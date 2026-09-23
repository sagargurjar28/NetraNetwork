"""
Neo4j GDS queries for board-level graph analytics.
All functions take a driver session and return JSON-serializable dicts.
Never raise — return empty results on failure.
"""
from typing import Any

_GRAPH_NAME: str = "boardGraph"


def _project_board_graph(session: Any, board_id: str) -> bool:
    """Project the board's pin-graph into GDS. Idempotent."""
    try:
        session.run(
            "CALL gds.graph.drop($name, false) YIELD graphName RETURN graphName",
            name=_GRAPH_NAME,
        )
    except Exception:
        pass

    try:
        session.run(
            """
            CALL gds.graph.project.cypher(
              $name,
              'MATCH (b:Board {id: $board_id})-[:HAS_PIN]->(n) RETURN id(n) AS id, labels(n) AS labels',
              'MATCH (b:Board {id: $board_id})-[:HAS_PIN]->(a)-[r]->(c) ' +
              'WHERE NOT type(r) IN ["HAS_PIN", "FOR_CASE"] ' +
              'RETURN id(a) AS source, id(c) AS target, type(r) AS type, coalesce(r.confidence, 1.0) AS weight',
              { parameters: { board_id: $board_id } }
            )
            YIELD graphName, nodeCount, relationshipCount
            """,
            name=_GRAPH_NAME,
            board_id=board_id,
        )
        return True
    except Exception:
        return False


def _cleanup(session: Any) -> None:
    try:
        session.run(
            "CALL gds.graph.drop($name, false) YIELD graphName RETURN graphName",
            name=_GRAPH_NAME,
        )
    except Exception:
        pass


def pagerank(session: Any, board_id: str, top_k: int = 10) -> list[dict[str, Any]]:
    """Top-K most central nodes by PageRank. Kingpin detection."""
    if not _project_board_graph(session, board_id):
        return []
    try:
        result: Any = session.run(
            """
            CALL gds.pageRank.stream($name)
            YIELD nodeId, score
            WITH gds.util.asNode(nodeId) AS n, score
            RETURN n.id AS id, n.label AS label, labels(n)[0] AS type, score
            ORDER BY score DESC
            LIMIT $top_k
            """,
            name=_GRAPH_NAME,
            top_k=top_k,
        )
        return [dict(r) for r in result]
    except Exception:
        return []
    finally:
        _cleanup(session)


def louvain(session: Any, board_id: str) -> list[dict[str, Any]]:
    """Community detection via Louvain. Returns groups of node ids."""
    if not _project_board_graph(session, board_id):
        return []
    try:
        result: Any = session.run(
            """
            CALL gds.louvain.stream($name)
            YIELD nodeId, communityId
            WITH gds.util.asNode(nodeId) AS n, communityId
            RETURN communityId, collect({id: n.id, label: n.label, type: labels(n)[0]}) AS members
            ORDER BY size(members) DESC
            """,
            name=_GRAPH_NAME,
        )
        return [dict(r) for r in result]
    except Exception:
        return []
    finally:
        _cleanup(session)


def shortest_path(
    session: Any, board_id: str, source_id: str, target_id: str
) -> dict[str, Any]:
    """Dijkstra shortest path between two pins."""
    if not _project_board_graph(session, board_id):
        return {"found": False, "path": []}
    try:
        result: Any = session.run(
            """
            MATCH (s {id: $source_id}), (t {id: $target_id})
            CALL gds.shortestPath.dijkstra.stream($name, {
              sourceNode: s, targetNode: t, relationshipWeightProperty: 'weight'
            })
            YIELD nodeIds, totalCost
            RETURN
              [nid IN nodeIds | gds.util.asNode(nid).label] AS labels,
              [nid IN nodeIds | gds.util.asNode(nid).id] AS ids,
              totalCost
            """,
            name=_GRAPH_NAME,
            source_id=source_id,
            target_id=target_id,
        )
        for record in result:
            ids: list[str] = list(record["ids"] or [])
            rels: list[str] = []
            if len(ids) > 1:
                rel_rows: Any = session.run(
                    """
                    UNWIND range(0, size($ids) - 2) AS i
                    MATCH (a {id: $ids[i]})-[r]->(b {id: $ids[i + 1]})
                    RETURN type(r) AS t
                    """,
                    ids=ids,
                )
                rels = [row["t"] for row in rel_rows]
            return {
                "found": True,
                "labels": list(record["labels"] or []),
                "ids": ids,
                "relationship_types": rels,
                "cost": record["totalCost"],
            }
        return {"found": False, "path": []}
    except Exception:
        return {"found": False, "path": []}
    finally:
        _cleanup(session)
