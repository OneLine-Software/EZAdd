// The design lab (LAB-74): five directions on the same basket, kept apart from the app.
// `npm run lab` to look, `npm run lab:build` for a static copy in dist-lab/. Never part of the production build.
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  root: fileURLToPath(new URL('./lab', import.meta.url)),
  base: './',
  plugins: [vue(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    outDir: fileURLToPath(new URL('./dist-lab', import.meta.url)),
    emptyOutDir: true,
    // One script and one stylesheet with the fonts inside, so the lab can be shared as a single page.
    assetsInlineLimit: 400_000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
