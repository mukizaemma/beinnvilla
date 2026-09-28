import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Alias map — keep this and jsconfig.json in sync if you ever add a new alias
export default defineConfig({
  plugins: [react()],
  resolve: {
    // .jsx must resolve before .js — every section pairs Name.jsx (component)
    // with Name.js (data file) sharing the same base filename. Without this,
    // an extensionless import like '@sections/home/HomeHero' silently
    // resolves to the data file instead of the component.
    extensions: ['.jsx', '.js', '.mjs', '.ts', '.tsx', '.json'],
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@sections': path.resolve(__dirname, 'src/sections'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@lib/queries': path.resolve(__dirname, 'src/features/hotel/queries'),
      '@lib/booking': path.resolve(__dirname, 'src/features/hotel/booking'),
      '@lib/cart': path.resolve(__dirname, 'src/features/hotel/cart'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@router': path.resolve(__dirname, 'src/router'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@lib': path.resolve(__dirname, 'src/lib'),
    },
  },
  optimizeDeps: {
    include: ['jquery'],
  },
})
