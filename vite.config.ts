import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Two pages: index.html = V0.2 (The Shattered Crown), v0.1.html = the preserved V0.1 prototype (unchanged source in src/).
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html'), v01: resolve(__dirname, 'v0.1.html') },
    },
  },
});
