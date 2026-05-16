// File: vite.config.ts
// Purpose: Vite config — proxies /upload and /query to Flask on port 5000
// Step: Step-7 — React UI

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
    plugins: [react()],
  server: {
    proxy: {
      // Forwards API calls to Flask so we avoid CORS issues in dev
      '/upload': 'http://localhost:5000',
      '/query':  'http://localhost:5000',
    },
  },
})

