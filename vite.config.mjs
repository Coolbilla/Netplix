// vite.config.mjs
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [] 
    }
  },
  server: {
    historyApiFallback: true,
  }
})
