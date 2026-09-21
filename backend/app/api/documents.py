import hashlib
import io
from datetime import datetime
from typing import Any
from uuid import UUID

import requests
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from pypdf import PdfReader
from sqlalchemy.orm import Session

from app.core.config import get_db, settings
from app.core.rbac import require_permission
from app.core.security import CurrentUser, get_current_user
from app.models.case import Case
from app.models.document import Document
from app.services import blockchain_service, ipfs_service

router: APIRouter = APIRouter(prefix="/api", tags=["documents"])


@router.post("/cases/{case_id}/documents/", status_code=status.HTTP_201_CREATED)
def upload_document(
    case_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_permission("write")),
) -> dict[str, Any]:
    case: Case | None = db.query(Case).filter(Case.id == case_id).first()
    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Case not found"
        )
    content: bytes = file.file.read()
    doc_hash: str = "0x" + hashlib.sha256(content).hexdigest()
    ipfs_cid: str | None = ipfs_service.upload_to_ipfs(content, file.filename or "unnamed")
    tx_hash: str | None = blockchain_service.anchor_hash(doc_hash, ipfs_cid or "")
    document: Document = Document(
        case_id=case_id,
        filename=file.filename or "unnamed",
        ipfs_cid=ipfs_cid,
        doc_hash=doc_hash,
        tx_hash=tx_hash,
        uploaded_by=user.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    filename: str = file.filename or "unnamed"
    extracted_text: str = ""
    try:
        if filename.lower().endswith(".pdf"):
            reader: PdfReader = PdfReader(io.BytesIO(content))
            extracted_text = "\n".join(
                (page.extract_text() or "") for page in reader.pages
            )
        else:
            extracted_text = content.decode("utf-8", errors="ignore")
    except Exception:
        extracted_text = ""

    if extracted_text.strip():
        try:
            requests.post(
                f"{settings.COPILOT_SERVICE_URL}/index-document",
                json={
                    "case_id": str(case_id),
                    "document_id": str(document.id),
                    "filename": filename,
                    "text": extracted_text,
                },
                timeout=60,
            )
        except Exception:
            pass  # never block upload on indexing failure
    created_at: datetime = document.created_at
    return {
        "id": str(document.id),
        "case_id": str(document.case_id),
        "filename": str(document.filename),
        "doc_hash": str(document.doc_hash),
        "ipfs_cid": document.ipfs_cid,
        "tx_hash": document.tx_hash,
        "uploaded_by": str(document.uploaded_by),
        "created_at": created_at.isoformat() if created_at is not None else None,
    }


@router.get("/cases/{case_id}/documents/")
def list_documents(
    case_id: UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
) -> list[dict[str, Any]]:
    documents: list[Document] = (
        db.query(Document).filter(Document.case_id == case_id).all()
    )
    result: list[dict[str, Any]] = []
    for document in documents:
        created_at: datetime = document.created_at
        result.append(
            {
                "id": str(document.id),
                "case_id": str(document.case_id),
                "filename": str(document.filename),
                "doc_hash": str(document.doc_hash),
                "created_at": created_at.isoformat()
                if created_at is not None
                else None,
            }
        )
    return result


class VerifyRequest(BaseModel):
    doc_hash: str


@router.post("/documents/verify")
def verify_document(
    payload: VerifyRequest,
    _user: CurrentUser = Depends(get_current_user),
) -> dict[str, Any]:
    return blockchain_service.verify_hash(payload.doc_hash)
