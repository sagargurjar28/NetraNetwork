from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import get_db
from app.core.rbac import require_permission
from app.core.security import CurrentUser, get_current_user
from app.models.user import User

router: APIRouter = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_permission("manage_users")),
) -> list[dict[str, Any]]:
    users: list[User] = db.query(User).all()
    return [
        {
            "id": str(u.id),
            "username": u.username,
            "role": u.role,
            "createdAt": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.get("/audit")
def list_audit(
    _: CurrentUser = Depends(require_permission("manage_users")),
) -> list[Any]:
    return []


@router.get("/health")
def admin_health(
    _: CurrentUser = Depends(get_current_user),
) -> dict[str, str]:
    return {
        "backend": "ok",
        "copilot": "unknown",
        "neo4j": "unknown",
        "qdrant": "unknown",
    }
