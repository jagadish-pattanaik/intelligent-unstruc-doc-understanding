# Intelligent Unstructured Document Understanding

A full-stack Retrieval-Augmented Generation (RAG) system that turns complex PDFs (text, tables, charts) into an explorable knowledge base and answers natural-language questions with grounded, cited responses.

A React web app talks to a FastAPI backend that parses documents with Docling, builds a document hierarchy graph with NetworkX, embeds content into ChromaDB, and generates answers using LLMs.

---

##  Features

- **Multi-modal ingestion** — Extract text, tables, and figures using Docling.
- **Document Hierarchy Graph** — Uses NetworkX to maintain the structural relationship of document chunks (Document → Pages → Chunks).
- **Semantic Vector Search** — Combines vector search (ChromaDB) with NVIDIA embeddings.
- **Reranking** — Improves the relevance of retrieved context using BM25 reranking.
- **Grounded Answers** — Retrieves top chunks and passes them to an LLM (`meta/llama-3.1-8b-instruct`) for accurate, context-aware answers.
- **Polished React frontend** — Vite + React 19 + Tailwind + GSAP animated UI.

---

##  Architecture

```text
┌──────────────┐   upload PDF        ┌─────────────────────────┐
│ React (Vite) │ ──POST /api/ingest─▶│  FastAPI (main.py)      │
│  frontend/   │                     │                         │
│              │ ──POST /api/chat───▶│  • Docling Parsing      │
│              │ ◀── JSON Answer ────│  • NetworkX Hierarchy   │
└──────────────┘                     └───────────┬─────────────┘
                                                 │
                                                 ▼
             ┌────────────────────────────────────────────────────────┐
             │  • Chunking & NVIDIA Embeddings                        │
             │  • ChromaDB (vector storage)                           │
             │  • BM25 Reranking                                      │
             │  • LLM (Llama-3.1-8b-instruct) Answer Generation       │
             └────────────────────────────────────────────────────────┘
```

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, GSAP |
| API | FastAPI, Uvicorn |
| Document parsing | Docling (layout + tables + figures) |
| Vector store | ChromaDB |
| Knowledge graph | NetworkX (DiGraph for Document Hierarchy) |
| LLM (reasoning) | `meta/llama-3.1-8b-instruct` (NVIDIA NIM) |
| Embeddings | `nvidia/nv-embedqa-e5-v5` (NVIDIA NIM) |
| Re-ranking | BM25 (`rank_bm25`) |

---

##  Getting Started

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- A free **NVIDIA NIM API key** (https://build.nvidia.com)

### 1. Backend (FastAPI + RAG engine)
```bash
# from the repo root
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# add your key
echo "NVIDIA_API_KEY=nvapi-xxxxxxxx" > .env

# run the API (http://localhost:8000)
uvicorn main:app --reload --port 8000
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install                          # Note: run 'npm install', not 'npm run install'
npm run dev                          # http://localhost:5173
```
If the frontend needs the API URL, set it in `frontend/.env` (e.g. `VITE_API_BASE=http://localhost:8000`). CORS is open on the backend by default.

### 3. Use it
Open the frontend, **upload a PDF**, wait for ingestion, then **ask questions**.

---

##  API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/api/health` | Liveness check |
| `POST` | `/api/ingest` | Upload a PDF (`multipart/form-data`, field `file`); parses and indexes the document |
| `POST` | `/api/chat`   | Ask a question (JSON `{ "query": "..." }`); returns JSON answer with sources |
