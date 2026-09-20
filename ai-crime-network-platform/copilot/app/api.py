from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.prompts import SYSTEM_PROMPT, build_prompt
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


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/generate", response_model=GenerateResponse)
def generate_response(payload: GenerateRequest) -> GenerateResponse:
    context: str
    citations: list[dict]
    context, citations = retrieve_context(payload.board_id, payload.message)
    if not context:
        context = "(No board context available.)"
    prompt: str = build_prompt(payload.message, context)
    answer: str = generate(prompt, SYSTEM_PROMPT)
    return GenerateResponse(answer=answer, citations=citations)
