import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Instead of importing inside the config function, we create an async function that
// will create and return our configuration
async function createViteConfig() {
  // Dynamically import vite-tsconfig-paths as an ES module
  const { default: tsconfigPaths } = await import('vite-tsconfig-paths');
  
  return defineConfig({
    plugins: [
      tsconfigPaths(),
      react()
    ],
    root: resolve(__dirname),
    publicDir: 'public',
    esbuild: false as const,
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'public/index.html'),
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