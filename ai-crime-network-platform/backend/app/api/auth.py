from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import get_db, settings
from app.core.rbac import require_permission
from app.core.security import CurrentUser, get_current_user
from app.models.user import User
from app.schemas.user import LoginRequest, RegisterRequest, TokenResponse, UserRead

router: APIRouter = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context: CryptContext = CryptContext(schemes=["bcrypt"])


def _create_access_token(user_id: str, role: str) -> str:
    expire: datetime = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload: dict[str, object] = {"sub": user_id, "role": role, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user: User | None = db.query(User).filter(User.username == payload.username).first()
    if user is None or not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token: str = _create_access_token(str(user.id), str(user.role))
    return TokenResponse(access_token=token, token_type="bearer", role=str(user.role))


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_permission("manage_users")),
) -> User:
    existing: User | None = (
        db.query(User).filter(User.username == payload.username).first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists"
        )
    new_user: User = User(
        username=payload.username,
        password_hash=pwd_context.hash(payload.password),
        role=payload.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/me")
def me(
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    u: User | None = db.query(User).filter(User.id == user.id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(u.id),
        "username": str(u.username),
        "role": str(u.role),
    }
