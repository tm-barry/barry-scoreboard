import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/barry-scoreboard/',
  plugins: [
    vue(),
    VitePWA({
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'BarryScoreboard',
        short_name: 'BarryScoreboard',
        description:
          'A simple PWA app for managing tournament brackets and tracking match scores.',
        theme_color: '#2f90ff',
        background_color: '#12141a',
        display: 'standalone',
        start_url: '/barry-scoreboard/',
        icons: [
          {
            src: '/barry-scoreboard/assets/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/barry-scoreboard/assets/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/barry-scoreboard/index.html',
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
});
