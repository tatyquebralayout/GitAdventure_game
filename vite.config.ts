import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'frontend'),
  publicDir: 'public',
  plugins: [
    tsconfigPaths(),
    react()
  ],
  esbuild: false,            // desabilita esbuild se for usar SWC 100%
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'frontend/public/index.html'),
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
  },
  css: {
    postcss: 'postcss.config.js'
  },
})
