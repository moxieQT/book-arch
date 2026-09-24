import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Алина — Архетипы и Тени',
        short_name: 'Алина',
        description: 'Авторские практики Алины и интерактивная 3D-книга «Архетипы и Тени»',
        theme_color: '#F4EFE6',
        background_color: '#F4EFE6',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,glb,ktx2,woff2}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  // Порт можно задать через PORT; по умолчанию 5174 (чтобы не конфликтовать с 5173)
  server: {
    port: Number(process.env.PORT) || 5174,
    host: true,
    strictPort: false,
  },
  build: {
    // Vite 8 собирает через Rolldown: rollupOptions.manualChunks им игнорируется
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three/ },
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|scheduler|zustand)[\\/]/ },
            // Авторские тексты арканов меняются независимо от кода — отдельный чанк лучше кешируется
            { name: 'arcana-texts', test: /src[\\/]numerology[\\/]data[\\/]/ },
          ],
        },
      },
    },
    // Самый крупный чанк — тексты арканов (~810 КБ, ~170 КБ в gzip): это данные, а не код
    chunkSizeWarningLimit: 900,
  },
})
