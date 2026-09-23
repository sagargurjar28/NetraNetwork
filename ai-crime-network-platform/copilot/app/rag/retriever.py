from typing import Any, Optional
from uuid import NAMESPACE_URL, uuid5

from fastembed import TextEmbedding
from neo4j import GraphDatabase
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
    VectorParams,
)

from app.core.config import settings
from app.rag.router import Intent, classify_intent

_driver: Any = None
_qdrant: Optional[QdrantClient] = None
_embedder: Optional[TextEmbedding] = None

VECTOR_SIZE: int = 384


def _get_driver() -> Any:
    global _driver
    if _driver is None:
        _driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )
    return _driver


def _get_qdrant() -> QdrantClient:
    global _qdrant
    if _qdrant is None:
        _qdrant = QdrantClient(url=settings.QDRANT_URL)
    return _qdrant


def _get_embedder() -> TextEmbedding:
    global _embedder
    if _embedder is None:
        _embedder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    return _embedder


def ensure_collection() -> None:
    """Create the Qdrant collection if it doesn't exist. Idempotent."""
    client: QdrantClient = _get_qdrant()
    existing: list[str] = [c.name for c in client.get_collections().collections]
    if settings.QDRANT_COLLECTION not in existing:
        client.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )


def _chunk_text(text: str, size: int = 500, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks by character count."""
    text = text.strip()
    if not text:
        return []
    chunks: list[str] = []
    start: int = 0
    while start < len(text):
        end: int = start + size
        chunks.append(text[start:end])
        start += size - overlap
    return [c for c in chunks if c.strip()]


def index_document(
    case_id: str,
    document_id: str,
    filename: str,
    text: str,
) -> int:
    """Embed document chunks and store in Qdrant. Returns number of chunks stored.
    Never raises — returns 0 on failure."""
    try:
        ensure_collection()
        chunks: list[str] = _chunk_text(text)
        if not chunks:
            return 0

        embedder: TextEmbedding = _get_embedder()
        vectors: list[Any] = list(embedder.embed(chunks))

        points: list[PointStruct] = []
        for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
            points.append(PointStruct(
                id=str(uuid5(NAMESPACE_URL, f"{document_id}:{i}")),
                vector=vector.tolist(),
                payload={
                    "case_id": case_id,
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_index": i,
                    "text": chunk,
                },
            ))

        _get_qdrant().upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=points,
        )
        return len(points)
    except Exception:
        return 0


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
            lines.append(f"  {row['plabel']} --{row['rel']}--> {row['mlabel']} (id: {row['mid']})")
            citations.append({
                "type": "connection",
                "id": row["mid"],
                "label": f"{row['plabel']} {row['rel']} {row['mlabel']}",
            })

    return ("\n".join(lines), citations)


def _vector_context(case_id: str, question: str, top_k: int = 5) -> tuple[str, list[dict]]:
    """Semantic search over document chunks stored in Qdrant.
    Filters by case_id."""
    try:
        ensure_collection()
        embedder: TextEmbedding = _get_embedder()
        query_vec: list[float] = list(embedder.embed([question]))[0].tolist()

        results: list[Any] = _get_qdrant().query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=query_vec,
            query_filter=Filter(
                must=[FieldCondition(key="case_id", match=MatchValue(value=case_id))]
            ),
            limit=top_k,
        ).points

        if not results:
            return ("", [])

        lines: list[str] = []
        citations: list[dict] = []
        seen_docs: set[Any] = set()
        for hit in results:
            p: dict = hit.payload or {}
            lines.append(
                f"[{p.get('filename')} | chunk {p.get('chunk_index')} | score {hit.score:.2f}]\n{p.get('text')}"
            )
            doc_id: Any = p.get("document_id")
            if doc_id and doc_id not in seen_docs:
                citations.append({
                    "type": "document",
                    "id": doc_id,
                    "label": p.get("filename", "document"),
                })
                seen_docs.add(doc_id)

        return ("\n\n".join(lines), citations)
    except Exception:
        return ("", [])


def _summary_context(board_id: str, question: str) -> tuple[str, list[dict]]:
    """Same as graph for now — the LLM does the summarizing."""
    return _graph_context(board_id, question)


def _hybrid_context(board_id: str, question: str) -> tuple[str, list[dict]]:
    """Run graph and vector retrieval, merge context and dedupe citations."""
    graph_ctx, graph_cites = _graph_context(board_id, question)
    vector_ctx, vector_cites = _vector_context(board_id, question)

    parts: list[str] = []
    if graph_ctx:
        parts.append("=== Graph Context ===")
        parts.append(graph_ctx)
    if vector_ctx:
        parts.append("=== Document Context ===")
        parts.append(vector_ctx)

    merged_ctx: str = "\n\n".join(parts)

    # Deduplicate citations by (type, id)
    seen: set[tuple[Any, Any]] = set()
    merged_cites: list[dict] = []
    for cite in graph_cites + vector_cites:
        key: tuple[Any, Any] = (cite.get("type"), cite.get("id"))
        if key in seen:
            continue
        seen.add(key)
        merged_cites.append(cite)

    return (merged_ctx, merged_cites)


def retrieve_context(
    board_id: Optional[str],
    question: str,
) -> tuple[str, list[dict], str]:
    """
    Classify intent, dispatch to the right retrieval strategy.
    For VECTOR, `board_id` is treated as a case_id filter (the board
    belongs to a case; documents are indexed by case_id).
    Returns (context_text, citations, intent_value).
    """
    intent: Intent = classify_intent(question)

    if not board_id:
        return ("", [], intent.value)

    try:
        if intent == Intent.GRAPH:
            ctx, cites = _graph_context(board_id, question)
        elif intent == Intent.VECTOR:
            # For vector search, use board_id as the case_id filter.
            # The backend indexes documents by case_id.
            ctx, cites = _vector_context(board_id, question)
        elif intent == Intent.SUMMARY:
            ctx, cites = _summary_context(board_id, question)
        elif intent == Intent.BOTH:
            ctx, cites = _hybrid_context(board_id, question)
        else:
            ctx, cites = ("", [])
    except Exception:
        ctx, cites = ("", [])

    return (ctx, cites, intent.value)
