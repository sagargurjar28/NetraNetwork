from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.prompts import get_system_prompt, build_prompt, build_history_messages
from app.rag.generator import generate
from app.rag.retriever import index_document, retrieve_context

router: APIRouter = APIRouter()


class GenerateRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    board_id: Optional[str] = None
    history: list[dict] = []


class GenerateResponse(BaseModel):
    answer: str
    citations: list[dict] = []
    intent: str = "general"


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/generate", response_model=GenerateResponse)
def generate_response(payload: GenerateRequest) -> GenerateResponse:
    context: str
    citations: list[dict]
    intent: str
    context, citations, intent = retrieve_context(payload.board_id, payload.message)
    if not context:
        context = "(No board context available.)"
    prompt: str = build_prompt(payload.message, context)
    system: str = get_system_prompt(intent)
    history_msgs: list[dict] = build_history_messages(payload.history)
    answer: str = generate(prompt, system, history=history_msgs)
    return GenerateResponse(answer=answer, citations=citations, intent=intent)


class IndexDocumentRequest(BaseModel):
    case_id: str
    document_id: str
    filename: str
    text: str


class IndexDocumentResponse(BaseModel):
    chunks_indexed: int


@router.post("/index-document", response_model=IndexDocumentResponse)
def index_document_endpoint(payload: IndexDocumentRequest) -> IndexDocumentResponse:
    count: int = index_document(
        case_id=payload.case_id,
        document_id=payload.document_id,
        filename=payload.filename,
        text=payload.text,
    )
    return IndexDocumentResponse(chunks_indexed=count)
