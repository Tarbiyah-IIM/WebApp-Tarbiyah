import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { resolveAppVersion } from './scripts/resolveAppVersion.mjs';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const { version: baseVersion } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const appVersion = resolveAppVersion({ rootDir, baseVersion });

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  test: {
    include: ['tests/**/*.test.js']
  }
});
