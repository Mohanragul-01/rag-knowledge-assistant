// File: src/types/index.ts
// Purpose: Shared TypeScript types used across components
// Step: Step-7 — React UI

export type Role = 'user' | 'assistant'


export interface Message {
  id:      string     // unique key for React list rendering
  role:    Role
  text:    string
  sources: string[]   // citation filenames — empty for user messages
}


export interface QueryResponse {
  status:  string
  answer:  string
  sources: string[]
}


export interface UploadResponse {
  status:        string
  filename:      string
  chunks_stored: number
}

