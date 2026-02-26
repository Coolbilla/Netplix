import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // This helps Rolldown (Vite's builder) skip the "external" check
    // and focus on finding your local files
    rollupOptions: {
      external: [] 
    }
  },
  server: {
    historyApiFallback: true,
  }
})
