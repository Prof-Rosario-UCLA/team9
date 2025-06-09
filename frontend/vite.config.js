import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/index.html',
      },
      manifest: {
        name: 'GitBlame',
        short_name: 'GitBlame',
        description: 'Chore Tracker PWA App developed by David and Enrique',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/pwa-192x192-new.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512-new.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512-new.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/bear.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: { cacheName: 'html-cache' }
          },
          {
            urlPattern: ({ request }) =>
              ['style', 'script', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'asset-cache' }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    outDir: '../backend/dist',
    emptyOutDir: true
  }
});
