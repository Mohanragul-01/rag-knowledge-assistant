// File: src/App.tsx
// Purpose: Root component — owns all state, wires FileUpload + ChatWindow + ChatInput
// Step: Step-7 — React UI

import { useState } from 'react'
import { v4 as uuid } from 'uuid'

import { queryRAG } from './api/client'
import type { Message } from './types'

import FileUpload  from './components/FileUpload'
import ChatWindow  from './components/ChatWindow'
import ChatInput   from './components/ChatInput'
import ThemeToggle from './components/ThemeToggle'


export default function App() {
  const [messages,    setMessages]    = useState<Message[]>([])
  const [isLoading,   setIsLoading]   = useState(false)
  const [pdfUploaded, setPdfUploaded] = useState(false)
  const [pdfName,     setPdfName]     = useState('')

  // ── Append a message to the history list ──────────────────────────────────
  function addMessage(role: Message['role'], text: string, sources: string[] = []) {
    setMessages(prev => [...prev, { id: uuid(), role, text, sources }])
  }

  // ── Called by FileUpload on successful upload ──────────────────────────────
  function handleUploaded(filename: string) {
    setPdfUploaded(true)
    setPdfName(filename)
    addMessage('assistant', `📄 **${filename}** is indexed and ready. Ask me anything about it.`)
  }

  // ── Called by ChatInput on submit ─────────────────────────────────────────
  async function handleSend(question: string) {
    addMessage('user', question)
    setIsLoading(true)

    try {
      const res = await queryRAG(question)
      addMessage('assistant', res.answer, res.sources)
    } catch {
      addMessage('assistant', '⚠️ Something went wrong. Is Flask running?')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-void-900">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-cosmic-100
                         px-6 py-4 dark:border-cosmic-900">
        <div className="flex items-center gap-3">
          <div className="animate-pulse-glow rounded-xl bg-cosmic-500 p-2 text-white">
            🔭
          </div>
          <div>
            <h1 className="font-display text-xl text-cosmic-700 dark:text-cosmic-300">
              RAG Assistant
            </h1>
            {pdfName && (
              <p className="font-mono text-[10px] text-cosmic-400 dark:text-cosmic-600">
                {pdfName}
              </p>
            )}
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — upload panel */}
        <aside className="w-72 shrink-0 border-r border-cosmic-100 p-4
                          dark:border-cosmic-900">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest
                        text-cosmic-400 dark:text-cosmic-600">
            Document
          </p>
          <FileUpload onUploaded={handleUploaded} />
        </aside>

        {/* Chat panel */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            disabled={!pdfUploaded}
          />
        </main>
      </div>
    </div>
  )
}
