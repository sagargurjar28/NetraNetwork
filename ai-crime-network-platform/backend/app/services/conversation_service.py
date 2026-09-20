from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.conversation import ChatMessage, Conversation


def _coerce_user_id(user_id: UUID | str) -> UUID:
    return user_id if isinstance(user_id, UUID) else UUID(str(user_id))


def get_or_create_conversation(
    db: Session,
    user_id: UUID | str,
    conversation_id: UUID | str | None,
    first_message: str,
) -> Conversation:
    uid: UUID = _coerce_user_id(user_id)
    if conversation_id is not None:
        cid: UUID = (
            conversation_id
            if isinstance(conversation_id, UUID)
            else UUID(str(conversation_id))
        )
        convo: Conversation | None = (
            db.query(Conversation).filter(Conversation.id == cid).first()
        )
        if convo is None or str(convo.user_id) != str(uid):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
        return convo
    convo = Conversation(user_id=uid, title=first_message[:60])
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return convo


def add_message(
    db: Session,
    conversation_id: UUID | str,
    role: str,
    content: str,
    citations: list[dict[str, Any]] | None = None,
) -> ChatMessage:
    message: ChatMessage = ChatMessage(
        conversation_id=conversation_id,
        role=role,
        content=content,
        citations=citations,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_conversation_with_messages(
    db: Session,
    conversation_id: UUID | str,
    user_id: UUID | str,
) -> Conversation | None:
    convo: Conversation | None = (
        db.query(Conversation).filter(Conversation.id == conversation_id).first()
    )
    if convo is None or str(convo.user_id) != str(user_id):
        return None
    return convo


def list_user_conversations(db: Session, user_id: UUID | str) -> list[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == _coerce_user_id(user_id))
        .order_by(Conversation.created_at.desc())
        .all()
    )
