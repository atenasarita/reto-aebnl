import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Precache all built JS, CSS, HTML, images, and geojson assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,geojson}'],
        // Serve index.html for all navigation requests (SPA fallback)
        navigateFallback: 'index.html',
        // Don't intercept API calls — the app handles those via localStorage cache
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /\/api\//,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: {
        name: 'AEBNL — Sistema de Gestión',
        short_name: 'AEBNL',
        description: 'Sistema de gestión para la Asociación Espina Bífida de Nuevo León',
        theme_color: '#1e3b8a',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/dashboard',
        icons: [
          {
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
