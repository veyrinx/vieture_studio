import { useSite } from '../../context.tsx';
import './Marquee.css';

export function Marquee() {
  const { C } = useSite();
  const items = [...C.marquee, ...C.marquee]; // doubled so the loop is seamless
  return (
    <section id="marquee" className="marquee" aria-label="Tech stack">
      <div className="marquee__track">
        {items.map((x, i) => (
          <span key={i}>{x}</span>
        ))}
      </div>
    </section>
  );
}
