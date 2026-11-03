import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Arrow, Icon } from '../../ui/Icon.tsx';
import { extProps } from '../../ui/format.ts';
import { plainText, safeUrl } from '../../../../shared/rich.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import type { ButtonSpec, CustomBlock as Block } from '../../../../shared/types.ts';
import './CustomBlock.css';

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l, i) => (
          <Rich as="p" className="lg" text={l} key={i} />
        ))}
    </>
  );
}

function BlockButton({ btn, className = 'btn btn--lg' }: { btn: ButtonSpec | undefined; className?: string }) {
  const { L } = useSite();
  const label = plainText(L(btn?.label));
  if (!label || !btn?.href) return null;
  const href = safeUrl(btn.href);
  return (
    <a className={className} href={href} {...extProps(href)}>
      {label}
      <Arrow />
    </a>
  );
}

function BlockHead({ b }: { b: Block }) {
  const { L } = useSite();
  const { eyebrow } = useSection();
  const eb = plainText(L(b.eyebrow));
  const title = L(b.title);
  const desc = L(b.desc);
  if (!eb && !title && !desc) return null;
  return (
    <div className="section__head reveal">
      <div>
        {eb && <p className="eyebrow">{eyebrow(eb)}</p>}
        {title && <Rich as="h2" text={title} />}
      </div>
      {desc && <Rich as="p" text={desc} />}
    </div>
  );
}

/** A block added from the admin ("+ Thêm khối mới"). */
export function CustomBlock({ b }: { b: Block }) {
  const { L, t } = useSite();
  const { eyebrow } = useSection();
  const items = b.items ?? [];
  const cls = `custom custom--${b.type}${b.type === 'cta' ? ' section--tight' : ''}`;

  let body: React.ReactNode;
  switch (b.type) {
    case 'cards':
      body = (
        <div className="container">
          <BlockHead b={b} />
          <div className="why">
            {items.map((it, i) => (
              <article className="why__item reveal" style={{ '--d': `${(i % 3) * 80}ms` } as React.CSSProperties} key={i}>
                <span className="why__icon">
                  <Icon name={it.icon} />
                </span>
                <div>
                  <Rich as="h3" text={L(it.title)} />
                  <Rich as="p" text={L(it.desc)} />
                  {it.url && (
                    <a className="card__more" href={safeUrl(it.url)} {...extProps(it.url)}>
                      {t('projects.view')} →
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
          <BlockButton btn={b.button} className="btn btn--lg custom__cta" />
        </div>
      );
      break;
    case 'media': {
      const eb = plainText(L(b.eyebrow));
      body = (
        <div className={`container media-block media-block--${b.imageSide === 'right' ? 'right' : 'left'}`}>
          <div className="media-block__img reveal">{b.image && <img src={safeUrl(b.image)} alt={plainText(L(b.title))} loading="lazy" />}</div>
          <div className="media-block__text reveal">
            {eb && <p className="eyebrow">{eyebrow(eb)}</p>}
            {L(b.title) && <Rich as="h2" text={L(b.title)} />}
            <Paragraphs text={L(b.body)} />
            <BlockButton btn={b.button} />
          </div>
        </div>
      );
      break;
    }
    case 'cta':
      body = (
        <div className="container">
          <div className="band reveal">
            <div>
              {L(b.title) && <Rich as="h3" text={L(b.title)} />}
              {L(b.desc) && <Rich as="p" text={L(b.desc)} />}
            </div>
            <BlockButton btn={b.button} className="btn btn--lg btn--light" />
          </div>
        </div>
      );
      break;
    case 'gallery':
      body = (
        <div className="container">
          <BlockHead b={b} />
          <div className="gallery">
            {items
              .filter((it) => it.image)
              .map((it, i) => (
                <figure className="reveal" style={{ '--d': `${(i % 4) * 60}ms` } as React.CSSProperties} key={i}>
                  <img src={safeUrl(it.image)} alt={plainText(L(it.caption))} loading="lazy" />
                  {L(it.caption) && <Rich as="figcaption" text={L(it.caption)} />}
                </figure>
              ))}
          </div>
        </div>
      );
      break;
    default:
      body = (
        <div className="container">
          <BlockHead b={b} />
          <div className="custom__body reveal">
            <Paragraphs text={L(b.body)} />
            <BlockButton btn={b.button} />
          </div>
        </div>
      );
  }
  return (
    <Section id={b.id} className={cls}>
      {body}
    </Section>
  );
}

/** How many eyebrow labels a block shows (for section numbering). */
export function customEyebrows(b: Block, L: (p: Block['eyebrow']) => string) {
  if (b.type === 'cta') return 0;
  return plainText(L(b.eyebrow)) ? 1 : 0;
}
