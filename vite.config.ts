import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import swc from 'vite-plugin-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  esbuild: false,            // desabilita esbuild se for usar SWC 100%
  build: {
    minify: 'terser',       // usa terser para melhor minificação
    terserOptions: {
      compress: {
        drop_console: true,  // remove console.logs em produção
        passes: 2            // múltiplas passagens para otimização
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'git-visualizations': ['@gitgraph/react', '@lightenna/react-mermaid-diagram', 'mermaid']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // aumenta o limite de aviso de tamanho de chunk
  }
})
