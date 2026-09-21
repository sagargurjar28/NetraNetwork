from typing import Any
from uuid import UUID

import requests
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_db, settings
from app.core.security import CurrentUser, get_current_user
from app.models.conversation import ChatMessage, Conversation
from app.schemas.copilot import (
    ChatRequest,
    ChatResponse,
    Citation,
    ConversationDetail,
    ConversationRead,
    MessageRead,
)
from app.services import conversation_service

router: APIRouter = APIRouter(prefix="/api/copilot", tags=["copilot"])


def _to_citations(raw: Any) -> list[Citation]:
    citations: list[Citation] = []
    if not isinstance(raw, list):
        return citations
    for item in raw:
        try:
            if isinstance(item, dict):
                citations.append(Citation(**item))
        except Exception:
            continue
    return citations


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ChatResponse:
    convo: Conversation = conversation_service.get_or_create_conversation(
        db, user.id, payload.conversation_id, payload.message
    )
    conversation_service.add_message(db, convo.id, "user", payload.message)
    # Fetch prior turns (excludes the current message which was just inserted).
    # The backend fetches 7 and drops the last (current message), leaving 6.
    all_turns: list[dict[str, str]] = conversation_service.get_recent_turns(
        db, convo.id, limit=7
    )
    history: list[dict[str, str]] = all_turns[:-1] if all_turns else []
    answer: str = "The Copilot service is unavailable. Please try again."
    citations: list[Citation] = []
    intent: str = "general"
    try:
        resp: requests.Response = requests.post(
            f"{settings.COPILOT_SERVICE_URL}/generate",
            json={
                "message": payload.message,
                "conversation_id": str(convo.id),
                "board_id": str(payload.board_id) if payload.board_id else None,
                "history": history,
            },
            timeout=60,
        )
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
        answer = str(data.get("answer", answer))
        citations = _to_citations(data.get("citations", []))
        intent = str(data.get("intent", "general"))
    except Exception:
        answer = "The Copilot service is unavailable. Please try again."
        citations = []
        intent = "general"
    conversation_service.add_message(
        db,
        convo.id,
        "assistant",
        answer,
        [c.model_dump() for c in citations],
        intent=intent,
    )
    return ChatResponse(
        conversation_id=convo.id, answer=answer, citations=citations, intent=intent
    )


@router.get("/conversations/", response_model=list[ConversationRead])
def list_conversations(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> list[Conversation]:
    return conversation_service.list_user_conversations(db, user.id)


@router.get("/conversations/{conversation_id}/", response_model=ConversationDetail)
def get_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> ConversationDetail:
    convo: Conversation | None = (
        conversation_service.get_conversation_with_messages(db, conversation_id, user.id)
    )
    if convo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    messages: list[ChatMessage] = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == convo.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return ConversationDetail(
        id=convo.id,
        title=convo.title,
        created_at=convo.created_at,
        messages=[MessageRead.model_validate(m) for m in messages],
    )


@router.delete(
    "/conversations/{conversation_id}/", status_code=status.HTTP_204_NO_CONTENT
)
def delete_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> Response:
    convo: Conversation | None = (
        conversation_service.get_conversation_with_messages(db, conversation_id, user.id)
    )
    if convo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    db.delete(convo)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
