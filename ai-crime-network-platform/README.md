# Netra — AI-Powered Criminal Network Analysis Platform

**Smart India Hackathon 2026 · Problem Statement 26189**

Netra is an investigation platform for Indian law enforcement. It ingests FIRs and case
documents, builds a live criminal network graph, and provides an AI Copilot that
answers investigator questions with citations back to source evidence.

Every uploaded document is pinned to IPFS and its hash is anchored on a blockchain,
giving courts a tamper-proof chain of custody.

---

## What It Does

Three integrated capabilities:

**1. Criminal Network Analysis**
Ingest FIRs, call detail records, and case documents. Extract entities (persons,
phones, locations, financial accounts) and relationships automatically. Visualize
the network on an interactive board. Detect communities, kingpins, and hidden links.

**2. Secure Document Management**
Every FIR is hashed (SHA-256), pinned to IPFS, and its hash anchored to a blockchain
ledger. Any investigator can verify a document's authenticity in seconds —
proving it hasn't been altered since upload.

**3. AI Investigation Copilot**
Ask questions in natural language. The Copilot classifies intent, retrieves from
the graph or document store, and returns answers with inline citations to specific
pins, connections, or documents. Remembers prior turns within a conversation.

---

## Architecture
┌──────────────────────────────────────────────────────────────────┐
│ React + Vite Frontend │
│ React Flow board · Copilot chat · Document manager │
└────────────────────────────┬─────────────────────────────────────┘
│ REST + JWT
┌────────────────────────────▼─────────────────────────────────────┐
│ Backend (FastAPI :8000) │
│ auth · cases · documents · boards · copilot proxy · RBAC │
└──┬────────────┬────────────┬─────────────┬────────────┬──────────┘
│ │ │ │ │
▼ ▼ ▼ ▼ ▼
┌──────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Postgres│ │ Neo4j │ │ Qdrant │ │ IPFS │ │ Hardhat │
│ data │ │ graph │ │ vectors │ │ files │ │ ledger │
└──────┘ └─────────┘ └──────────┘ └──────────┘ └──────────┘
▲ ▲
│ │
┌────────┴─────────────┴────────┐
│ Copilot Service (FastAPI │
│ :8001 · RAG pipeline) │
│ Groq LLM (llama-3.3-70b) │
└───────────────────────────────┘

text

**Services:**

| Component | Technology | Port |
|---|---|---|
| Backend API | FastAPI + SQLAlchemy | 8000 |
| Copilot RAG service | FastAPI + Qdrant + Groq | 8001 |
| Frontend | React 19 + Vite + React Flow | 5173 |
| Relational DB | PostgreSQL 16 | 5433 |
| Graph DB | Neo4j 5.20 (GDS plugin) | 7474 / 7687 |
| Vector DB | Qdrant | 6333 |
| Document storage | IPFS (Kubo) | 5001 |
| Blockchain | Hardhat local node | 8545 |
| LLM | Groq `openai/gpt-oss-120b` | cloud |

---

## Quick Start

### Prerequisites

- **Podman Desktop** (or Docker Desktop) — for databases and IPFS
- **Python 3.11+**
- **Node.js 20+**
- **Git**
- A free **Groq API key** — https://console.groq.com/keys

### 1. Clone and configure

```bash
git clone https://github.com/sagargurjar28/NetraNetwork.git
cd NetraNetwork/ai-crime-network-platform

# Create the backend .env
cp backend/.env.example backend/.env
# Edit backend/.env — fill in GROQ_API_KEY

# Create the Copilot .env
cp copilot/.env.example copilot/.env
# Edit copilot/.env — fill in GROQ_API_KEY

## Prerequisites
- Docker Desktop
- Python 3.11+
- Node.js 20+

## One-Time Setup
```bash
cp .env.example .env