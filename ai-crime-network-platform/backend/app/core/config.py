from collections.abc import Generator

from neo4j import Driver, GraphDatabase
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from sqlalchemy.ext.declarative import DeclarativeMeta


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/crime_platform"
    SECRET_KEY: str = "change-me-in-env"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"
    WEB3_PROVIDER: str = "http://127.0.0.1:8545"
    CONTRACT_ADDRESS: str = ""
    CONTRACT_ABI_PATH: str = "../smart-contracts/artifacts/contracts/EvidenceLedger.sol/EvidenceLedger.json"
    PRIVATE_KEY: str = ""
    IPFS_API: str = "http://localhost:5001"
    LLM_PROVIDER: str = "groq"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    COPILOT_SERVICE_URL: str = "http://localhost:8001"
    PINATA_API_KEY: str = ""
    PINATA_API_SECRET: str = ""
    QDRANT_API_KEY: str = ""


settings: Settings = Settings()

engine: Engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal: sessionmaker[Session] = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base: DeclarativeMeta = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


_neo4j_driver: Driver | None = None


def get_neo4j_driver() -> Driver:
    global _neo4j_driver
    if _neo4j_driver is None:
        _neo4j_driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )
    return _neo4j_driver


def close_neo4j_driver() -> None:
    global _neo4j_driver
    if _neo4j_driver is not None:
        _neo4j_driver.close()
        _neo4j_driver = None
