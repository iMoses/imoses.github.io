import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// One entry per lab entry that has interactive figures. Output names are stable
// (no hashes); the Jekyll layout appends a build timestamp for cache busting.
const entries = {
  'react-svg-charts': 'react-svg-charts/main.jsx',
  'nas-dashboard': 'nas-dashboard/main.jsx',
};

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: here('.'),
  plugins: [react()],
  build: {
    outDir: here('../assets/demos'),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, here(v)])),
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
});
