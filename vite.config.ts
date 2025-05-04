import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import swc from 'vite-plugin-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    swc({
      swcOptions: {
        jsc: {
          parser: {
            syntax: "typescript"
          }
        }
      }
    })
  ],
  esbuild: false,            // desabilita esbuild se for usar SWC 100%
})
