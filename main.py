import os
import uuid
import shutil
import tempfile
import networkx as nx
import httpx
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import chromadb
from docling.document_converter import DocumentConverter
from rank_bm25 import BM25Okapi
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
HEADERS = {
    "Authorization": f"Bearer {NVIDIA_API_KEY}",
    "Content-Type": "application/json"
}

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
try:
    collection = chroma_client.get_collection(name="document_collection")
except Exception:
    collection = chroma_client.create_collection(name="document_collection")

# Initialize NetworkX Document Hierarchy
doc_graph = nx.DiGraph()

# Setup Docling
doc_converter = DocumentConverter()

class ChatRequest(BaseModel):
    query: str

def get_embedding(text: str) -> list[float]:
    url = "https://integrate.api.nvidia.com/v1/embeddings"
    payload = {
        "input": [text],
        "model": "nvidia/nv-embedqa-e5-v5",
        "input_type": "query",
        "truncate": "NONE"
    }
    response = httpx.post(url, headers=HEADERS, json=payload, timeout=30.0)
    response.raise_for_status()
    return response.json()["data"][0]["embedding"]

def rerank_chunks(query: str, chunks: List[str]) -> List[str]:
    if not chunks:
        return []
    # Using BM25 as a fast, simple reranker to reorder the dense retrieval results
    tokenized_query = query.lower().split()
    tokenized_corpus = [doc.lower().split() for doc in chunks]
    bm25 = BM25Okapi(tokenized_corpus)
    scores = bm25.get_scores(tokenized_query)
    
    scored_chunks = sorted(zip(scores, chunks), key=lambda x: x[0], reverse=True)
    return [chunk for score, chunk in scored_chunks]

@app.post("/api/ingest")
async def ingest_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, file.filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 1. Parse with Docling (extracts text, tables, figures layout)
        doc = doc_converter.convert(temp_path).document
        markdown_text = doc.export_to_markdown()
        
        # Simple chunking (split by double newlines)
        chunks = [c.strip() for c in markdown_text.split("\n\n") if len(c.strip()) > 50]
        
        # 2. Build Document Hierarchy in NetworkX
        doc_node_id = f"doc_{uuid.uuid4()}"
        doc_graph.add_node(doc_node_id, type="document", name=file.filename)
        
        chunk_ids = []
        embeddings = []
        metadatas = []
        
        for i, chunk in enumerate(chunks):
            chunk_id = f"chunk_{uuid.uuid4()}"
            chunk_ids.append(chunk_id)
            # Embed chunk
            embeddings.append(get_embedding(chunk))
            metadatas.append({"source": file.filename, "chunk_index": i})
            
            # Add to graph
            doc_graph.add_node(chunk_id, type="chunk", content=chunk)
            doc_graph.add_edge(doc_node_id, chunk_id, relation="contains")
        
        # 3. Store in ChromaDB
        if chunk_ids:
            collection.add(
                documents=chunks,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=chunk_ids
            )
            
        return {"message": "Document ingested successfully", "chunks": len(chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(temp_dir)

@app.post("/api/chat")
async def chat(request: ChatRequest):
    query = request.query
    
    # 1. Embed query and search ChromaDB
    try:
        query_embedding = get_embedding(query)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=10
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {e}")
        
    retrieved_chunks = results["documents"][0] if results["documents"] else []
    
    if not retrieved_chunks:
        return {"answer": "I don't have enough context to answer that.", "sources": []}
    
    # 2. Rerank the retrieved chunks
    reranked_chunks = rerank_chunks(query, retrieved_chunks)
    
    # Take top 3 for context
    context_chunks = reranked_chunks[:3]
    context_text = "\n\n".join(context_chunks)
    
    # 3. Generate Answer with LLM
    prompt = f"Context:\n{context_text}\n\nQuestion: {query}\n\nAnswer concisely based ONLY on the context:"
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    payload = {
        "model": "meta/llama-3.1-8b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 500
    }
    
    try:
        response = httpx.post(url, headers=HEADERS, json=payload, timeout=30.0)
        response.raise_for_status()
        answer = response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Generation failed: {e}")
    
    return {"answer": answer, "sources": context_chunks}

@app.get("/api/health")
async def health():
    return {"status": "ok"}
