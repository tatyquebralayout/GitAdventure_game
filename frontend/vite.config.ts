import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'; // Import directly

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react()
  ],
  root: resolve(__dirname),
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), // Vite automatically looks for index.html in the root or publicDir
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'git-visualizations': ['@gitgraph/react', '@lightenna/react-mermaid-diagram', 'mermaid']
        }
      }
    },
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  css: {
    postcss: './postcss.config.js'
  }
});