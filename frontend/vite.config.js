import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // ✅ Enable service worker in development
      devOptions: {
        enabled: true,
        type: 'module', // or 'classic' depending on your SW script
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
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'asset-cache',
            },
          },
        ],
      },
    }),
  ],
});
