// Vercel entry point: the whole Express app (SSR, API, admin, static assets) runs as one function.
// `dist/` is produced by `npm run build` and included through vercel.json -> functions.includeFiles.
// These imports make Vercel trace the SSR runtime dependencies (the SSR bundle is loaded dynamically).
import 'react';
import 'react-dom/server';
import 'react/jsx-runtime';
import app from '../dist/server/index.js';

export default app;
