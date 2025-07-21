import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { execSync } from 'child_process'

// Get last commit date
const lastCommitDate = execSync('git log -1 --format=%cd').toString()

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      port: 5173,
    },
  },
  define: {
    __LAST_COMMIT_DATE__: JSON.stringify(lastCommitDate)
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['react-bootstrap', 'bootstrap'],
          auth: ['@auth0/auth0-react'],
          utils: ['axios', 'react-toastify'],
        },
      },
    },
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
  },
})
