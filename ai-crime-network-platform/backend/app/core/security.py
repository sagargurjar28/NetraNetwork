from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings

oauth2_scheme: OAuth2PasswordBearer = OAuth2PasswordBearer(tokenUrl="/auth/login")


class CurrentUser:
    def __init__(self, id: str, role: str) -> None:
        self.id: str = id
        self.role: str = role


def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    credentials_exception: HTTPException = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
    )
    try:
        payload: dict[str, object] = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except JWTError:
        raise credentials_exception from None
    subject: object | None = payload.get("sub")
    if subject is None:
        raise credentials_exception
    role: object = payload.get("role", "investigator")
    return CurrentUser(id=str(subject), role=str(role))
