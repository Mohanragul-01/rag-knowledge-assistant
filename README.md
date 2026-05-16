# RAG Assistant

Built a web application which uses Retrieval-Augmented Generation (RAG) to upload PDFs, ask questions in a chat interface, and receive accurate answers with source citations — powered by local embeddings and a free LLM.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [How RAG Works](#how-rag-works)
- [Known Limitations](#known-limitations)
- [Interview Q&A](#interview-qa)

---

## What It Does

1. User uploads a PDF via the browser
2. The backend extracts text, splits it into overlapping chunks, embeds each chunk into a vector using a local model, and stores everything in ChromaDB
3. User types a question in the chat window
4. The backend embeds the question, finds the 5 most semantically similar chunks in ChromaDB, builds a prompt, and sends it to Groq (LLaMA 3)
5. LLaMA 3 returns a cited answer — the frontend renders it as formatted markdown with source badges

---

## Architecture

### Upload Flow

```
Browser (React)
  → Axios POST /upload (multipart/form-data)
  → Flask receives file
  → PyMuPDF extracts raw text from every PDF page
  → LangChain RecursiveCharacterTextSplitter splits into 500-char overlapping chunks
  → sentence-transformers (all-MiniLM-L6-v2) embeds each chunk → 384-dim float vector
  → ChromaDB upserts (vector + raw text + source filename) to disk
  → Flask returns { chunks_stored: N }
```

### Query Flow

```
Browser (React)
  → Axios POST /query { question: "..." }
  → Flask receives question
  → sentence-transformers embeds question → 384-dim vector
  → ChromaDB cosine similarity search → top-5 nearest chunk vectors
  → LangChain builds prompt: system instruction + numbered chunks + question
  → Groq API (llama3-8b-8192) generates answer strictly from context
  → Flask returns { answer: "...", sources: ["file.pdf"] }
  → React renders answer as markdown with citation badges
```

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Backend framework | Python + Flask | Simple, minimal, widely understood |
| RAG orchestration | LangChain | Handles chunking, retrieval chain wiring |
| Embedding model | sentence-transformers `all-MiniLM-L6-v2` | Free, local, strong semantic quality (~90MB) |
| LLM | Groq API `llama-3.3-70b-versatile` | Free tier, extremely fast inference |
| Vector database | ChromaDB | In-process, persists to disk, no server needed |
| PDF extraction | PyMuPDF (`fitz`) | Fast, handles complex PDFs reliably |
| Frontend | React + TypeScript + Vite | Component-based, type-safe, fast dev server |
| Styling | Tailwind CSS | Utility-first, dark mode via class strategy |
| HTTP client | Axios | Cleaner than fetch — auto JSON, better errors |
| Production server | Gunicorn | WSGI server required for Render deployment |

---

## Project Structure

```
rag-assistant/
│
├── backend/
│   ├── app.py              # Flask entry point — routes + CORS setup
│   ├── config.py           # All constants + env variable loading (single source of truth)
│   ├── ingestor.py         # PDF text extraction + chunking
│   ├── embedder.py         # Embedding with sentence-transformers + ChromaDB storage
│   ├── retriever.py        # Query embedding + top-K similarity search
│   ├── generator.py        # Prompt building + Groq LLM call
│   ├── requirements.txt    # Pinned Python dependencies
│   ├── render.yaml         # Render deployment config
│   ├── .env.example        # Template — copy to .env and fill in values
│   ├── .gitignore
│   ├── uploads/            # Temp storage for uploaded PDFs (git-ignored)
│   └── chroma_store/       # ChromaDB vector index on disk (git-ignored)
│
└── frontend/
    ├── src/
    │   ├── main.tsx                    # React entry point
    │   ├── App.tsx                     # Root component — owns all state
    │   ├── index.css                   # Tailwind directives + cosmic purple theme
    │   ├── api/
    │   │   └── client.ts               # Axios calls to /upload and /query
    │   ├── components/
    │   │   ├── FileUpload.tsx          # Drag-and-drop PDF uploader
    │   │   ├── ChatWindow.tsx          # Scrollable message history
    │   │   ├── ChatInput.tsx           # Question input + send button
    │   │   ├── Message.tsx             # Message bubble + markdown rendering + citations
    │   │   └── ThemeToggle.tsx         # Light/dark mode switcher
    │   └── types/
    │       └── index.ts                # Shared TypeScript interfaces
    ├── .env.local          # Local dev env vars (git-ignored)
    ├── .env.production     # Production env vars (committed — no secrets inside)
    ├── vite.config.ts      # Vite config + dev proxy to Flask
    ├── tailwind.config.ts  # Colour tokens + dark mode + animations
    ├── postcss.config.js   # Required by Tailwind
    ├── vercel.json         # Vercel deployment config
    ├── index.html          # HTML shell
    └── .gitignore
```

---

## Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### 1 — Clone the repo

```bash
git clone https://github.com/your-username/rag-assistant.git
cd rag-assistant
```

### 2 — Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file from the template
cp .env.example .env
```

Open `.env` and set your values:

```
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:5173
```

Start Flask:

```bash
python app.py
# Server runs on http://localhost:5000
```

> **Note:** The first run downloads the `all-MiniLM-L6-v2` embedding model (~90MB). This is expected — it only happens once and is cached locally.

### 3 — Frontend setup

Open a second terminal:

```bash
cd frontend

# Install dependencies
npm install
npm install uuid @types/uuid react-markdown

# Start Vite dev server
npm run dev
# App runs on http://localhost:5173
```

### 4 — Verify it works

1. Open `http://localhost:5173`
2. Drop a PDF into the upload panel on the left
3. Wait for the green confirmation message
4. Type a question in the chat input and press Enter
5. You should see a formatted answer with a citation badge

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | — | Your Groq API key from console.groq.com |
| `FRONTEND_URL` | ✅ Yes | `http://localhost:5173` | Allowed CORS origin — set to Vercel URL in production |
| `FLASK_DEBUG` | No | `true` | Set to `false` in production |
| `PORT` | No | `5000` | Render injects this automatically |
| `CHUNK_SIZE` | No | `500` | Characters per chunk — tune for your document type |
| `CHUNK_OVERLAP` | No | `50` | Overlap between chunks — prevents answers being cut off |
| `TOP_K` | No | `5` | Number of chunks retrieved per query |
| `CHROMA_DIR` | No | `chroma_store` | Path where ChromaDB persists to disk |
| `UPLOAD_DIR` | No | `uploads` | Path where uploaded PDFs are saved temporarily |

### Frontend

| File | Variable | Description |
|---|---|---|
| `.env.local` | `VITE_API_URL=` | Empty — Vite proxy handles routing locally |
| `.env.production` | `VITE_API_URL=https://your-app.onrender.com` | Your Render backend URL |

---

## Deployment

### Backend → Render

1. Push `backend/` to a GitHub repository
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo
3. Set the following in the Render dashboard:
   - **Runtime:** Python
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120`
4. Add environment variables under **Environment**:
   ```
   GROQ_API_KEY   = your_actual_key
   FRONTEND_URL   = https://your-app.vercel.app    ← fill after Vercel deploy
   FLASK_DEBUG    = false
   CHROMA_DIR     = /opt/render/project/src/chroma_store
   UPLOAD_DIR     = /opt/render/project/src/uploads
   ```
5. Deploy. Copy the Render URL (e.g. `https://rag-assistant-backend.onrender.com`)
6. Verify: visit `https://your-render-url.onrender.com/health` — should return `{"status":"ok"}`

### Frontend → Vercel

1. Push `frontend/` to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Framework preset: **Vite**
4. Add environment variable under **Settings → Environment Variables**:
   ```
   VITE_API_URL = https://your-render-url.onrender.com
   ```
5. Deploy. Copy the Vercel URL (e.g. `https://rag-assistant.vercel.app`)
6. Go back to **Render** → update `FRONTEND_URL` to your Vercel URL → **Manual Deploy**

### Final verification

- Open your Vercel URL in the browser
- Upload a PDF — should succeed with no CORS errors in the browser console
- Ask a question — should return a cited answer from the deployed backend
