import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  esbuild: false,            // desabilita esbuild se for usar SWC 100%
  build: {
    minify: 'esbuild',       // usa esbuild para minificação eficiente
    sourcemap: false,        // desabilita sourcemaps em produção
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'git-visualizations': ['@gitgraph/react', '@lightenna/react-mermaid-diagram', 'mermaid']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
