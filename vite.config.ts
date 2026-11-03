import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    // The server bundle only needs code; public/ files are served from the client build
    copyPublicDir: !isSsrBuild,
    // Keep fonts as real files: the server's CSP (font-src 'self') blocks data: URIs
    assetsInlineLimit: (file) => (/\.(woff2?|ttf)$/.test(file) ? false : undefined),
    rollupOptions: isSsrBuild
      ? undefined
      : {
          input: {
            site: resolve(import.meta.dirname, 'index.html'),
            admin: resolve(import.meta.dirname, 'admin.html'),
          },
        },
  },
}));
