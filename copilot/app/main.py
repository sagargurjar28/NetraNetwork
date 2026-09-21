from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.rag.retriever import ensure_collection

app: FastAPI = FastAPI(title="Netra Copilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def on_startup() -> None:
    try:
        ensure_collection()
    except Exception as e:
        print(f"[warn] Qdrant collection setup failed: {e}")


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "netra-copilot", "status": "running"}
