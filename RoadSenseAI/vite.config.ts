import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// VITE_BASE_URL is set to /RoadSenseAI/ when building for GitHub Pages deployment.
// Locally it defaults to '/' so development is unaffected.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL ?? '/',
})
