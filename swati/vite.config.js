// Vite config (the dev server + build tool for the React app).
// - Loads the React and Tailwind CSS plugins.
// - In development, any request to /api is forwarded (proxied) to the backend,
//   so the frontend can call fetch("/api/...") without CORS problems.
//   Default backend: http://localhost:5000. Set API_PROXY to use another one (used by tests).

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      '/api': process.env.API_PROXY || 'http://localhost:5000',
    },
  },
})
