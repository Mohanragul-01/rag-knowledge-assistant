// File: src/components/Message.tsx
// Purpose: Single chat message bubble — user right, assistant left, citations below
// Step: Step-7 — React UI

import ReactMarkdown from 'react-markdown'
import type { Message as MsgType } from '../types'


interface Props {
  message: MsgType
}


export default function Message({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex animate-fade-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] space-y-1`}>

        {/* Bubble */}
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            // User: solid cosmic purple
            ? 'rounded-tr-sm bg-cosmic-500 text-white dark:bg-cosmic-600'
            // Assistant: card surface
            : 'card rounded-tl-sm text-void-800 dark:text-cosmic-100'
          }`}
        >
          {isUser ? (
          // User messages are plain text — no markdown needed
          message.text
        ) : (
          // Assistant messages use ReactMarkdown so lists, bold, headers render properly
          <ReactMarkdown
            components={{
              // Paragraphs — add spacing between them
              p:      ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              // Ordered + unordered lists
              ul:     ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
              ol:     ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
              li:     ({ children }) => <li className="leading-relaxed">{children}</li>,
              // Bold + italic
              strong: ({ children }) => <strong className="font-medium text-cosmic-800 dark:text-cosmic-200">{children}</strong>,
              em:     ({ children }) => <em className="italic opacity-90">{children}</em>,
              // Inline code — monospace pill
              code:   ({ children }) => (
                <code className="rounded bg-cosmic-100 px-1 py-0.5 font-mono text-[11px]
                                 text-cosmic-700 dark:bg-void-700 dark:text-cosmic-300">
                  {children}
                </code>
              ),
              // Block code — full-width monospace box
              pre:    ({ children }) => (
                <pre className="mb-2 overflow-x-auto rounded-lg bg-cosmic-50 p-3
                                font-mono text-[11px] dark:bg-void-700">
                  {children}
                </pre>
              ),
              // H1-H3 headings
              h1: ({ children }) => <h1 className="mb-1 font-display text-base font-medium">{children}</h1>,
              h2: ({ children }) => <h2 className="mb-1 font-display text-sm  font-medium">{children}</h2>,
              h3: ({ children }) => <h3 className="mb-1 text-sm font-medium opacity-80">{children}</h3>,
              // Horizontal rule
              hr: () => <hr className="my-2 border-cosmic-200 dark:border-cosmic-700" />,
            }}
          >
            {message.text}
          </ReactMarkdown>
        )}
        </div>

        {/* Citations — only shown on assistant messages that have sources */}
        {!isUser && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {message.sources.map(src => (
              <span
                key={src}
                className="rounded-full border border-cosmic-200 bg-cosmic-50
                           px-2 py-0.5 font-mono text-[10px] text-cosmic-600
                           dark:border-cosmic-700 dark:bg-void-700 dark:text-cosmic-300"
              >
                📎 {src}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
