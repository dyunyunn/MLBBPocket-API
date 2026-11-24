import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'MLBBPocket',
        short_name: 'MLBBPocket',
        description: 'Hero Catalog & Build Recommendation MLBB',
        theme_color: '#070b19',
        background_color: '#070b19',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})