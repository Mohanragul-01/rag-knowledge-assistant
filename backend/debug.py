# File: debug.py
# Purpose: Inspect what is actually stored in ChromaDB and test raw retrieval
# Step: Debug — Step 4/5

from embedder import model, collection

# ── Check 1: How many chunks are stored? ──────────────────────────────────────
count = collection.count()
print(f"\n[1] Chunks in ChromaDB: {count}")

# ── Check 2: Peek at first 3 stored chunks ────────────────────────────────────
if count > 0:
    sample = collection.peek(3)
    print(f"\n[2] Sample documents:")
    for doc in sample["documents"]:
        print(f"  → {doc[:120]}")

# ── Check 3: Raw similarity test ──────────────────────────────────────────────
TEST_QUESTION = "What is this document about?"
vector = model.encode(TEST_QUESTION).tolist()
results = collection.query(
    query_embeddings=[vector],
    n_results=3,
    include=["documents", "distances"]
)
print(f"\n[3] Top 3 results for: '{TEST_QUESTION}'")
for doc, dist in zip(results["documents"][0], results["distances"][0]):
    print(f"  dist={round(dist,4)} → {doc[:120]}")
