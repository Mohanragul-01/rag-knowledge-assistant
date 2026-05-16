# File: ingestor.py
# Purpose: Extract raw text from a PDF and split it into overlapping chunks
# Step: Step-2 — PDF Ingestion

import fitz  # PyMuPDF — fitz is the internal module name
from langchain_text_splitters import RecursiveCharacterTextSplitter

import config  # chunk size + overlap live here, not hardcoded


# ── Text extraction ────────────────────────────────────────────────────────────
def extract_text(pdf_path: str) -> str:
    # Opens the PDF and pulls raw text from every page into one string
    doc   = fitz.open(pdf_path)
    pages = [page.get_text() for page in doc]
    return "\n".join(pages)


# ── Chunking ───────────────────────────────────────────────────────────────────
def split_into_chunks(text: str) -> list[str]:
    # RecursiveCharacterTextSplitter tries paragraphs → sentences → words
    # Overlap prevents answers being split across chunk boundaries
    # TODO: understand this — why overlap helps retrieval quality (Core Concept #2)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
    )
    return splitter.split_text(text)


# ── Public API ─────────────────────────────────────────────────────────────────
def ingest_pdf(pdf_path: str, filename: str) -> list[dict]:
    # Orchestrates extract → split; returns chunk dicts ready for embedder
    raw_text = extract_text(pdf_path)
    chunks   = split_into_chunks(raw_text)

    # Source filename attached here so citations work in Step-5 generator
    return [{"text": chunk, "source": filename} for chunk in chunks]

