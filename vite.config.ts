import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  root: 'frontend',
  publicDir: '../public',
  css: {
    postcss: 'frontend/postcss.config.js'
  },
  plugins: [
    react()
  ],
  esbuild: false,            // desabilita esbuild se for usar SWC 100%
  build: {
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'git-visualizations': ['@gitgraph/react', '@lightenna/react-mermaid-diagram', 'mermaid']
        }
      }
    },
    minify: 'esbuild',       // usa esbuild para minificação eficiente
    sourcemap: false,        // desabilita sourcemaps em produção
    chunkSizeWarningLimit: 1000
  }
})
