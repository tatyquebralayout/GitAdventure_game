import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path' // Re-add resolve

// Revert to async function to handle ESM import in CJS context
async function createViteConfig() {
  // Dynamically import vite-tsconfig-paths as an ES module
  const { default: tsconfigPaths } = await import('vite-tsconfig-paths');
  
  return defineConfig({
    plugins: [
      tsconfigPaths(),
      react()
    ],
    root: resolve(__dirname), // Restore explicit root
    base: '/', // Explicitly set base path
    publicDir: 'public',
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'public/index.html'), // Correct path to index.html inside publicDir
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
}

// Export the result of the async function
export default createViteConfig();