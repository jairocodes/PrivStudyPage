import { defineConfig } from 'vite';

// base relativa: el sitio compilado funciona en cualquier subcarpeta (GitHub Pages, Netlify, XAMPP...)
export default defineConfig({
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
});
