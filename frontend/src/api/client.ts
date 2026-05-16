// File: src/api/client.ts
// Purpose: Axios functions for /upload and /query — handles both local and deployed URLs
// Step: Cross-cutting — deployment aware

import axios from 'axios'
import type { QueryResponse, UploadResponse } from '../types'


// Local dev:  VITE_API_URL='' → relative paths → Vite proxy forwards to Flask :5000
// Production: VITE_API_URL='https://your-app.onrender.com' → direct HTTPS to Render
const BASE = import.meta.env.VITE_API_URL ?? ''


// ── Upload ─────────────────────────────────────────────────────────────────────
export async function uploadPDF(file: File): Promise<UploadResponse> {
  // multipart/form-data required — Axios sets the correct Content-Type automatically
  const form = new FormData()
  form.append('file', file)

  const { data } = await axios.post<UploadResponse>(`${BASE}/upload`, form)
  return data
}


// ── Query ──────────────────────────────────────────────────────────────────────
export async function queryRAG(question: string): Promise<QueryResponse> {
  const { data } = await axios.post<QueryResponse>(`${BASE}/query`, { question })
  return data
}
