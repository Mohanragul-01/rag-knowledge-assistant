# File: generator.py
# Purpose: Build a RAG prompt from retrieved chunks and get a cited answer from Groq
# Step: Step-5 — Answer Generation

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

import config


# ── LLM — loaded once at module level ─────────────────────────────────────────
# Avoids re-initialising the client on every request
llm = ChatGroq(
    model_name   = config.GROQ_MODEL,
    temperature  = config.GROQ_TEMPERATURE,
    max_tokens   = config.GROQ_MAX_TOKENS,
    groq_api_key = config.GROQ_API_KEY,
)


# ── Prompt builder ─────────────────────────────────────────────────────────────
def _build_messages(question: str, chunks: list[dict]) -> list:
    # Formats retrieved chunks as numbered context blocks with source labels
    # TODO: understand this — prompt design controls hallucination risk (Core Concept #5)
    context = "\n\n".join(
        f"[{i+1}] Source: {c['source']}\n{c['text']}"
        for i, c in enumerate(chunks)
    )

    system = SystemMessage(content=(
        "You are a helpful assistant that answers questions strictly from the provided context. "
        "Structure your answer clearly — use bullet points or numbered steps where appropriate. "
        "Always cite the source filename(s) you used. "
        f"If the context does not contain the answer, reply with exactly: {config.NO_ANSWER_TEXT}"
    ))

    human = HumanMessage(content=(
        f"Context:\n{context}\n\n"
        f"Question: {question}"
    ))

    return [system, human]


# ── Public API ─────────────────────────────────────────────────────────────────
def generate_answer(question: str, chunks: list[dict]) -> dict:
    # Calls Groq with the built prompt; returns answer text + deduplicated sources
    messages = _build_messages(question, chunks)
    response = llm.invoke(messages)
    sources  = list({c["source"] for c in chunks})  # set removes duplicates

    return {
        "answer":  response.content,
        "sources": sources,
    }
