<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--                            HEADER                                   -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

<div align="center">

<!-- Replace with your logo path or a hosted URL -->
<img src="ai-crime-network-platform/frontend/public/assets/netra-logo.svg" alt="Netra Network" width="320" />

<br />
<br />

### AI-Powered Criminal Network Analysis Platform

*Turning scattered FIRs, call records, and case files into an interactive, intelligent investigation workspace.*

<br />

[![SIH 2026](https://img.shields.io/badge/SIH-2026-ef4444?style=for-the-badge)](https://sih.gov.in)
[![Problem Statement](https://img.shields.io/badge/PS-26189-3b82f6?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](#license)

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.20-008CC1?style=flat-square&logo=neo4j&logoColor=white)](https://neo4j.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-1.12-DC244C?style=flat-square)](https://qdrant.tech/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docs.docker.com/compose/)

<br />

[**Live Demo**](https://netra-network.vercel.app) &nbsp;·&nbsp;
[**API Docs**](https://netra-backend.up.railway.app/docs) &nbsp;·&nbsp;
[**Report a Bug**](../../issues) &nbsp;·&nbsp;
[**Request a Feature**](../../issues)

</div>

---

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--                         TABLE OF CONTENTS                           -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

<details>
<summary><b>📖 Table of Contents</b></summary>

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Data Flow](#-data-flow)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Security](#-security)
- [Team](#-team)
- [License](#-license)

</details>

---

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--                            OVERVIEW                                 -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## 🎯 Overview

**Netra Network** is a unified investigation platform built for Indian law enforcement agencies. It ingests First Information Reports (FIRs), call detail records, and case documents, then transforms them into a **live, queryable criminal knowledge graph** — complete with an AI Copilot that answers investigator questions with inline citations back to source evidence.

Every uploaded document is cryptographically hashed, pinned to **IPFS**, and anchored on a **blockchain ledger** — giving courts a tamper-proof chain of custody from the moment of upload.

> **Built for Smart India Hackathon 2026 — Problem Statement 26189**

---

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--                         THE PROBLEM                                 -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## 🚨 The Problem

Modern criminal investigations generate **enormous volumes of unstructured data**:

- Handwritten FIRs scanned to PDFs
- Call detail records spanning thousands of numbers
- Bank statements, property records, witness statements
- Cross-jurisdictional cases with fragmented ownership

Investigators today rely on **spreadsheets, paper files, and memory**. Patterns that take weeks to spot manually — shared phone numbers, circular money flows, recurring meeting locations — often go unnoticed until it's too late.

**Key gaps:**

| Gap | Impact |
|---|---|
| No relationship mapping | Hidden links between suspects missed |
| Manual document handling | Evidence integrity cannot be proven in court |
| No semantic search | Finding relevant past cases takes days |
| Siloed datasets | Phone records, bank data, FIRs never analyzed together |

---

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--                        THE SOLUTION                                 -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## 💡 The Solution

Netra Network solves this with **four integrated capabilities**:

<table>
<tr>
<td width="50%" valign="top">

### 🕸️ Criminal Network Analysis
Auto-extract entities (persons, phones, locations, bank accounts) from FIRs. Build a live relationship graph in **Neo4j**. Detect kingpins, communities, and hidden links through **Graph Data Science** algorithms.

</td>
<td width="50%" valign="top">

### 🤖 AI Investigation Copilot
Ask questions in natural language. The Copilot classifies intent, retrieves from the graph or document store, and returns answers with **inline citations** to specific pins, connections, or documents.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 📄 Secure Document Management
Every FIR is hashed (SHA-256), pinned to **IPFS**, and its hash anchored on a **blockchain**. Verify any document's authenticity in seconds — proving it hasn't been altered since upload.

</td>
<td width="50%" valign="top">

### 🔍 Intelligent Link Discovery
Rule-based engine surfaces **hidden connections** — two suspects linked through a shared phone, a joint bank transfer, or a common meeting location — without being told to look for them.

</td>
</tr>
</table>

---

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--                          KEY FEATURES                               -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## ✨ Key Features

<table>
<tr><td>

**🗺️ Interactive Investigation Board**
- Drag-and-drop pins for persons, phones, locations, documents
- Draw connections with relationship types
- Real-time sync to Neo4j graph database
- Vertical person cards with role badges (suspect / victim / witness)
- Export board as PNG, share full PDF report

</td><td>

**🧠 Hybrid RAG Copilot**
- Intent router classifies queries → graph / vector / summary / both
- Semantic search over FIR chunks using **fastembed** + Qdrant
- Conversation memory persists across turns
- Groq-powered `openai/gpt-oss-120b` for low-latency generation
- Every claim cited with `[pin:id]`, `[connection:id]`, or `[document:id]`

</td></tr>
<tr><td>

**📊 Graph Analytics**
- **PageRank** — detect kingpins and hubs
- **Louvain** — discover communities/cells
- **Dijkstra shortest path** — reveal hidden chains between suspects
- All computed on **Neo4j GDS**

</td><td>

**🔐 Document Chain-of-Custody**
- SHA-256 content hashing on upload
- IPFS pinning via **Pinata** (permanent CID)
- Blockchain anchor via **Hardhat + Solidity** (`EvidenceLedger.sol`)
- On-chain verification endpoint

</td></tr>
<tr><td>

**🔬 Automated NER Extraction**
- spaCy `en_core_web_sm` for person/location extraction
- Custom regex for Indian phone numbers, ₹ amounts, dates
- Auto-creates pins from uploaded FIRs
- Person ↔ phone co-occurrence edges auto-generated

</td><td>

**🔒 Enterprise-Grade Security**
- JWT authentication (HS256, configurable expiry)
- Role-based access control: `admin`, `investigator`, `analyst`, `viewer`
- Case-level audit trail
- CORS-restricted origins per environment

</td></tr>
</table>

---

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!--                      SYSTEM ARCHITECTURE                            -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## 🏛️ System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client Layer"]
        FE["React 19 + Vite<br/>React Flow · Zustand · TanStack Query"]
    end

    subgraph API["⚙️ API Layer"]
        BE["FastAPI Backend :8000<br/>Auth · Cases · Boards · Documents"]
        CO["Copilot Service :8001<br/>RAG · Intent Router · Citations"]
    end

    subgraph Data["💾 Data Layer"]
        PG[("PostgreSQL<br/>Cases · Users · Conversations")]
        N4[("Neo4j<br/>Criminal Graph · GDS")]
        QD[("Qdrant<br/>Vector Embeddings")]
    end

    subgraph Storage["📦 Storage Layer"]
        IPFS["IPFS via Pinata<br/>Document CIDs"]
        BC["Blockchain<br/>EvidenceLedger.sol"]
    end

    subgraph External["🌐 External Services"]
        GROQ["Groq API<br/>openai/gpt-oss-120b"]
    end

    FE -- "REST + JWT" --> BE
    BE -- "proxy" --> CO
    BE --> PG
    BE --> N4
    BE -- "upload" --> IPFS
    BE -- "anchor hash" --> BC
    BE -- "index text" --> QD
    CO --> N4
    CO --> QD
    CO -- "generate" --> GROQ

    style FE fill:#3b82f6,color:#fff
    style BE fill:#22c55e,color:#fff
    style CO fill:#22c55e,color:#fff
    style PG fill:#4169E1,color:#fff
    style N4 fill:#008CC1,color:#fff
    style QD fill:#DC244C,color:#fff
    style IPFS fill:#65C2CB,color:#fff
    style BC fill:#F16822,color:#fff
    style GROQ fill:#ef4444,color:#fff

