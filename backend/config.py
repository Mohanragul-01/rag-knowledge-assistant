# File: config.py
# Purpose: Single source of truth for all backend constants and environment variables
# Step: Cross-cutting — imported by app.py, embedder.py, retriever.py, generator.py

import os
from dotenv import load_dotenv


load_dotenv()  # reads .env file into os.environ before anything else imports this


# ── Server ─────────────────────────────────────────────────────────────────────
HOST  = "0.0.0.0"
PORT  = int(os.environ.get("PORT", 5000))  # Render injects PORT automatically
DEBUG = os.environ.get("FLASK_DEBUG", "true").lower() == "true"


# ── CORS ───────────────────────────────────────────────────────────────────────
# In .env set: FRONTEND_URL=http://localhost:5173          (local)
# In Render dashboard set: FRONTEND_URL=https://your-app.vercel.app  (production)
_frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = [_frontend_url]


# ── File upload ────────────────────────────────────────────────────────────────
UPLOAD_DIR         = os.environ.get("UPLOAD_DIR", "uploads")
ALLOWED_EXTENSIONS = {"pdf"}


# ── ChromaDB ───────────────────────────────────────────────────────────────────
CHROMA_DIR      = os.environ.get("CHROMA_DIR", "chroma_store")
COLLECTION_NAME = "rag_chunks"


# ── Embedding model ────────────────────────────────────────────────────────────
EMBEDDING_MODEL = "all-MiniLM-L6-v2"


# ── Chunking ───────────────────────────────────────────────────────────────────
CHUNK_SIZE    = int(os.environ.get("CHUNK_SIZE",    500))
CHUNK_OVERLAP = int(os.environ.get("CHUNK_OVERLAP",  50))


# ── Retrieval ──────────────────────────────────────────────────────────────────
TOP_K = int(os.environ.get("TOP_K", 5))


# ── Groq LLM ───────────────────────────────────────────────────────────────────
GROQ_API_KEY    = os.environ["GROQ_API_KEY"]   # hard fail if missing — better than silent errors
GROQ_MODEL      = "llama-3.3-70b-versatile"
GROQ_MAX_TOKENS = int(os.environ.get("GROQ_MAX_TOKENS", 512))
GROQ_TEMPERATURE = float(os.environ.get("GROQ_TEMPERATURE", 0.2))


# ── LLM behaviour ──────────────────────────────────────────────────────────────
NO_ANSWER_TEXT = "I don't have enough information in the provided context to answer that question."
