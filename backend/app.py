# File: app.py
# Purpose: Flask entry point — registers routes and configures CORS from environment
# Step: Cross-cutting — works identically local and on Render

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import config
from ingestor  import ingest_pdf
from embedder  import store_chunks
from retriever import retrieve_chunks
from generator import generate_answer


# ── App setup ──────────────────────────────────────────────────────────────────
app = Flask(__name__)

# origins= list comes from config so it changes per environment without touching code
# supports_credentials lets the browser send cookies if we add auth later
CORS(app, origins=config.ALLOWED_ORIGINS, supports_credentials=True)

os.makedirs(config.UPLOAD_DIR, exist_ok=True)


# ── Helpers ────────────────────────────────────────────────────────────────────
def _is_pdf(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS
    )


def _error(message: str, code: int):
    # Single place to build error responses — keeps route handlers clean
    return jsonify({"status": "error", "message": message}), code


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    # Render uses this to confirm the service is alive after deploy
    return jsonify({"status": "ok"}), 200


@app.route("/upload", methods=["POST"])
def upload():
    # Guards: file present → is PDF → save → ingest → embed → store
    if "file" not in request.files:
        return _error("No file part in request", 400)

    file = request.files["file"]

    if file.filename == "":
        return _error("No file selected", 400)

    if not _is_pdf(file.filename):
        return _error("Only PDF files are accepted", 415)

    try:
        save_path = os.path.join(config.UPLOAD_DIR, file.filename)
        file.save(save_path)
        chunks = ingest_pdf(save_path, file.filename)
        store_chunks(chunks)

        return jsonify({
            "status":        "ok",
            "filename":      file.filename,
            "chunks_stored": len(chunks),
        }), 200

    except Exception as e:
        return _error(f"Ingestion failed: {str(e)}", 500)


@app.route("/query", methods=["POST"])
def query():
    # Guards: JSON body → question present → retrieve → generate → return
    body = request.get_json(silent=True)

    if not body:
        return _error("Request body must be JSON", 400)

    question = body.get("question", "").strip()

    if not question:
        return _error("Field 'question' is required and cannot be empty", 400)

    try:
        chunks = retrieve_chunks(question)
        result = generate_answer(question, chunks)

        return jsonify({
            "status":  "ok",
            "answer":  result["answer"],
            "sources": result["sources"],
        }), 200

    except Exception as e:
        return _error(f"Query failed: {str(e)}", 500)


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
