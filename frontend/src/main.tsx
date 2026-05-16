// File: src/main.tsx
// Purpose: React entry point — mounts App into #root
// Step: Step-7 — React UI

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

