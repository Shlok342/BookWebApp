import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Drops the final bundle right inside static/dist
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    lib: {
      // Explicitly sets the entry point so it ignores index.html
      entry: resolve(__dirname, 'react_src/main.jsx'),
      formats: ['es'],
      fileName: 'stats-modal-bundle'
    },
    rollupOptions: {
      // CRITICAL FIX: Removed the input block. 
      // Do not declare "input" here while using build.lib mode.
    }
  }
});
