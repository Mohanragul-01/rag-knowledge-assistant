# File: embedder.py
# Purpose: Embed text chunks with sentence-transformers and persist them in ChromaDB
# Step: Step-3 — Embed + Store

from sentence_transformers import SentenceTransformer
import chromadb

import config  # model name, chroma path, collection name live here


# ── Model + DB — loaded once at module level ───────────────────────────────────
# Avoids reloading the ~90MB model on every request (cold-start risk)
model  = SentenceTransformer(config.EMBEDDING_MODEL)
client = chromadb.PersistentClient(path=config.CHROMA_DIR)

# get_or_create so restarts don't wipe existing indexed data
collection = client.get_or_create_collection(config.COLLECTION_NAME)


# ── Embedding ──────────────────────────────────────────────────────────────────
def embed_texts(texts: list[str]) -> list[list[float]]:
    # Returns one 384-dim float vector per text string
    # TODO: understand this — each vector encodes semantic meaning (Core Concept #1)
    return model.encode(texts, show_progress_bar=False).tolist()


# ── Storage ────────────────────────────────────────────────────────────────────
def store_chunks(chunks: list[dict]) -> None:
    # Upsert prevents duplicate chunks when the same PDF is re-uploaded
    texts      = [c["text"]   for c in chunks]
    sources    = [c["source"] for c in chunks]
    embeddings = embed_texts(texts)

    # ID = source + index — must be unique and stable across restarts
    ids = [f"{source}_{i}" for i, source in enumerate(sources)]

    collection.upsert(
        ids        = ids,
        embeddings = embeddings,
        documents  = texts,
        metadatas  = [{"source": s} for s in sources],
    )
    print(f"[embedder] Stored {len(chunks)} chunks → {config.CHROMA_DIR}/")

