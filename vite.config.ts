import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'lumina-app.html')
      }
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true
  },
  server: {
    port: 3000,
    open: false
  }
});
