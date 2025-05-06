import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Prevent production builds
const env = process.env.NODE_ENV;
if (env === 'production') {
  throw new Error('Production mode is disabled. Please use development mode only.');
}

export default defineConfig({
  plugins: [react()],
  root: './',
  publicDir: './public',
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@frontend': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  // Disable production build
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true
  }
});