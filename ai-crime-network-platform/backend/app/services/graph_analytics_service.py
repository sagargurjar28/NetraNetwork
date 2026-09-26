"""
Wraps the GDS analytics module with a Neo4j driver session.
The GDS module lives in ml-services/ which is optional — cloud
deploys (Railway) may not include it. If missing, analytics
functions return safe defaults instead of crashing startup.
"""
import sys
from pathlib import Path
from typing import Any, Optional
from uuid import UUID

analytics: Optional[Any] = None

try:
    _ML_ROOT: Path = Path(__file__).resolve().parents[3] / "ml-services"
    if str(_ML_ROOT) not in sys.path:
        sys.path.insert(0, str(_ML_ROOT))
    from graph_analytics.gds_queries import analytics as _analytics  # noqa: E402
    analytics = _analytics
except Exception as _e:
    print(f"[graph_analytics_service] GDS unavailable (non-fatal): {_e}")

from app.core.config import get_neo4j_driver


def _session() -> Any:
    return get_neo4j_driver().session()


def get_pagerank(board_id: UUID, top_k: int = 10) -> list[dict[str, Any]]:
    if analytics is None:
        return []
    try:
        with _session() as s:
            return analytics.pagerank(s, str(board_id), top_k)
    except Exception:
        return []


def get_communities(board_id: UUID) -> list[dict[str, Any]]:
    if analytics is None:
        return []
    try:
        with _session() as s:
            return analytics.louvain(s, str(board_id))
    except Exception:
        return []


def get_shortest_path(
    board_id: UUID, source_id: str, target_id: str
) -> dict[str, Any]:
    if analytics is None:
        return {"found": False, "path": []}
    try:
        with _session() as s:
            return analytics.shortest_path(s, str(board_id), source_id, target_id)
    except Exception:
        return {"found": False, "path": []}