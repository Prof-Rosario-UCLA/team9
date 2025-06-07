import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    host: '0.0.0.0', 
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Enable service worker during development
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/',
      },

      manifest: {
        name: 'GitBlame',
        short_name: 'GitBlame',
        description: 'Chore Tracker PWA App',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192-new.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512-new.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512-new.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        runtimeCaching: [
          {
            // Cache HTML pages (including your React entry point)
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
            },
          },
          {
            // Cache JS, CSS, and worker files
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'asset-cache',
            },
          },
          {
            // Cache images (optional but recommended)
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
});
