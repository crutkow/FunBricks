import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  publicDir: 'assets',
  server: {
    host: '127.0.0.1',
    port: 4173,
  },
  build: {
    outDir: '../dist',
  },
});
