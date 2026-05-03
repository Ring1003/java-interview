import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'build-questions',
      buildStart() {
        console.log('\n📦 Building question data...')
        execSync('npx tsx scripts/build-questions.ts', { stdio: 'inherit' })
      },
    },
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor'
          }
        },
      },
    },
  },
})
