# File: retriever.py
# Purpose: Embed an incoming question and retrieve the top-K most similar chunks
# Step: Step-4 — Retrieval

from embedder import model, collection  # reuse already-loaded model + DB handle
import config                           # TOP_K lives here


# ── Public API ─────────────────────────────────────────────────────────────────
def retrieve_chunks(question: str) -> list[dict]:
    # Embed the question into the same vector space as the stored chunks
    # TODO: understand this — cosine similarity finds nearest neighbours (Core Concept #3)
    query_vector = model.encode(question).tolist()

    results = collection.query(
        query_embeddings = [query_vector],
        n_results        = config.TOP_K,
        include          = ["documents", "metadatas", "distances"],
    )

    return _parse_results(results)


# ── Result parsing ─────────────────────────────────────────────────────────────
def _parse_results(results: dict) -> list[dict]:
    # ChromaDB returns parallel lists — zip into readable dicts
    # Split from retrieve_chunks so each function does exactly one thing
    docs      = results["documents"][0]  # [0] = first (only) query vector
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    return [
        {
            "text":     doc,
            "source":   meta["source"],
            "distance": round(dist, 4),  # lower = more similar
        }
        for doc, meta, dist in zip(docs, metadatas, distances)
    ]
