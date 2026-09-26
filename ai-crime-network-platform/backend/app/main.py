from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, auth, boards, cases, copilot, documents, graph, network, reports
from app.core.config import Base, close_neo4j_driver, engine, get_neo4j_driver
from app.models import audit as audit_models
from app.models import board as board_models
from app.models import case as case_models
from app.models import conversation as conversation_models  # noqa: F401
from app.models import document as document_models
from app.models import user as user_models

app: FastAPI = FastAPI(title="AI Crime Network Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    driver = get_neo4j_driver()
    with driver.session() as session:
        session.run("RETURN 1")
        session.run(
            "CREATE CONSTRAINT IF NOT EXISTS FOR (b:Board) REQUIRE b.board_id IS UNIQUE"
        )
        session.run(
            "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Case) REQUIRE c.case_id IS UNIQUE"
        )


@app.on_event("shutdown")
def on_shutdown() -> None:
    close_neo4j_driver()


app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(documents.router)
app.include_router(boards.router)
app.include_router(copilot.router)
app.include_router(graph.router)
app.include_router(network.router)
app.include_router(admin.router)
app.include_router(reports.router)
