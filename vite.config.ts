import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'frontend/public',
  css: {
    postcss: 'frontend/postcss.config.js'
  },
  plugins: [
    tsconfigPaths(),
    react()
  ],
  esbuild: false,            // desabilita esbuild se for usar SWC 100%
  build: {
    rollupOptions: {
      input: 'frontend/index.html',
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
