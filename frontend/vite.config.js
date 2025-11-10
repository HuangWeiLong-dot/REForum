import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // 不重写路径，直接转发 /api 到后端
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})



