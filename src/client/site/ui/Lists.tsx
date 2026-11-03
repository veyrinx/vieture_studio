import { Rich } from './Rich.tsx';

export function Ticks({ items, className = 'ticks' }: { items: string[] | undefined; className?: string }) {
  return (
    <ul className={className}>
      {(items ?? []).map((x, i) => (
        <Rich as="li" key={i} text={x} />
      ))}
    </ul>
  );
}

export function Chips({ items, className = 'chips' }: { items: string[] | undefined; className?: string }) {
  return (
    <ul className={className}>
      {(items ?? []).map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}

/** Body text: one paragraph per line; lines starting with "- " become a bullet list. */
export function TextBlocks({ text }: { text: string | undefined }) {
  const out: React.ReactNode[] = [];
  let items: string[] = [];
  const flush = () => {
    if (items.length) out.push(<Ticks key={out.length} items={items} />);
    items = [];
  };
  for (const line of String(text ?? '').split('\n')) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith('- ')) items.push(l.slice(2));
    else {
      flush();
      out.push(<Rich as="p" key={out.length} text={l} />);
    }
  }
  flush();
  return <>{out}</>;
}
