// Server-side rendering of the public pages (used by src/server/index.ts).
import { renderToString } from 'react-dom/server';
import { App } from './App.tsx';
import type { PageData } from '../../shared/types.ts';

export function render(data: PageData): string {
  return renderToString(<App data={data} />);
}
