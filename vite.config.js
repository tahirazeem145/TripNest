import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Exclude the Spring Boot backend from Vite's file watcher.
      // Without this, Maven downloads/builds inside backend/ crash the dev server.
      ignored: ['**/backend/**'],
    },
  },
})
