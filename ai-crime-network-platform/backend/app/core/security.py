from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from app.core.config import settings

oauth2_scheme = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(self, id: str, role: str) -> None:
        self.id: str = id
        self.role: str = role


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return CurrentUser(id=payload["sub"], role=payload.get("role", "investigator"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")