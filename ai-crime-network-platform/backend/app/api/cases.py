from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_db
from app.core.rbac import require_permission
from app.core.security import CurrentUser, get_current_user
from app.models.case import Case
from app.schemas.case import CaseCreate, CaseRead

router: APIRouter = APIRouter(prefix="/api/cases", tags=["cases"])


@router.post("/", response_model=CaseRead, status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CaseCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_permission("write")),
) -> Case:
    case: Case = Case(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        created_by=user.id,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.get("/", response_model=list[CaseRead])
def list_cases(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> list[Case]:
    return db.query(Case).all()


@router.get("/{case_id}/", response_model=CaseRead)
def get_case(
    case_id: UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> Case:
    case: Case | None = db.query(Case).filter(Case.id == case_id).first()
    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Case not found"
        )
    return case
