import {defineConfig} from 'vite';
export default defineConfig({base:'/Global/',build:{outDir:'dist',assetsDir:'static',rollupOptions:{input:'index.html'}}});
