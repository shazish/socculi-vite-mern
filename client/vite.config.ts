import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Get last commit date
const lastCommitDate = execSync('git log -1 --format=%cd').toString()

export default defineConfig({
  plugins: [react()],
  define: {
    __LAST_COMMIT_DATE__: JSON.stringify(lastCommitDate)
  }
})
