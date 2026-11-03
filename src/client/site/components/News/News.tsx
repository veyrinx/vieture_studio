import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Section, useSection } from '../../ui/Section.tsx';
import { SectionHead } from '../../ui/SectionHead.tsx';
import { PostCard } from '../PostCard/PostCard.tsx';
import type { PostSummary } from '../../../../shared/types.ts';
import './News.css';

export function News({ posts }: { posts: PostSummary[] }) {
  const { t, href } = useSite();
  const { eyebrow } = useSection();
  return (
    <Section id="news">
      <div className="container">
        <SectionHead prefix="news" eyebrow={eyebrow(t('news.eyebrow'))} />
        <div className="posts" id="news-list">
          {posts.map((p, i) => (
            <PostCard p={p} i={i} reveal more={false} key={p.slug} />
          ))}
        </div>
        <div className="news__all reveal">
          <Rich as="a" className="btn btn--ghost btn--lg" href={href('/blog')} text={t('news.all')} />
        </div>
      </div>
    </Section>
  );
}
