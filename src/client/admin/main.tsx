import { createRoot } from 'react-dom/client';
import '../fonts/index.ts';
import { App } from './App.tsx';

createRoot(document.getElementById('app')!).render(<App />);
