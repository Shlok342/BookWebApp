import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production')
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      lib: {
        entry: resolve(__dirname, 'react_src/main.jsx'),
        formats: ['es'],
        fileName: 'stats-modal-bundle'
      },
      rollupOptions: {}
    }
  });