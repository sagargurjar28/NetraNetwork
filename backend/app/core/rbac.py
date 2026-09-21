from collections.abc import Callable
from fastapi import Depends, HTTPException, status

from app.core.security import CurrentUser, get_current_user

ROLE_PERMISSIONS: dict[str, list[str]] = {
    "admin": ["read", "write", "delete", "manage_users"],
    "investigator": ["read", "write", "delete"],
    "analyst": ["read", "write"],
    "viewer": ["read"],
}


def has_permission(role: str, action: str) -> bool:
    return action in ROLE_PERMISSIONS.get(role, [])


def require_permission(action: str) -> Callable[[CurrentUser], CurrentUser]:
    def _dependency(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if not has_permission(user.role, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role}' lacks '{action}' permission",
            )
        return user

    return _dependency
