// Hydrates the server-rendered page with the same data the server used.
import { hydrateRoot } from 'react-dom/client';
import '../fonts/index.ts';
import { App } from './App.tsx';
import type { PageData } from '../../shared/types.ts';

const data = JSON.parse(document.getElementById('page-data')!.textContent!) as PageData;

// Returning visitors who chose English get the English page (the URL decides what the server renders).
let saved: string | null = null;
try {
  saved = localStorage.getItem('lang');
} catch {
  /* storage blocked */
}
const params = new URLSearchParams(location.search);
if (saved === 'en' && !params.has('lang') && data.lang === 'vi') {
  params.set('lang', 'en');
  location.replace(`${location.pathname}?${params}${location.hash}`);
} else {
  hydrateRoot(document.getElementById('root')!, <App data={data} />);
}
