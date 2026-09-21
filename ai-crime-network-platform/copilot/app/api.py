from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.prompts import get_system_prompt, build_prompt
from app.rag.generator import generate
from app.rag.retriever import retrieve_context

router: APIRouter = APIRouter()


class GenerateRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    board_id: Optional[str] = None


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
    answer: str = generate(prompt, system)
    return GenerateResponse(answer=answer, citations=citations, intent=intent)
