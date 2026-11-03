import { useSite } from '../../context.tsx';
import { PageShell } from '../PageShell.tsx';
import './NotFound.css';

const LABELS = {
  vi: { title: 'Không tìm thấy trang', desc: 'Trang bạn tìm không tồn tại hoặc đã được di chuyển.', home: '← Về trang chủ', blog: 'Tin tức & Blog', careers: 'Tuyển dụng' },
  en: { title: 'Page not found', desc: 'The page you are looking for does not exist or has moved.', home: '← Back to home', blog: 'News & Blog', careers: 'Careers' },
};

export function NotFound() {
  const { lang, href } = useSite();
  const T = LABELS[lang];
  return (
    <PageShell mainClass="section notfound">
      <div className="container notfound__inner">
        <p className="notfound__code flow" aria-hidden="true">
          404
        </p>
        <h1>{T.title}</h1>
        <p className="lg">{T.desc}</p>
        <div className="notfound__links">
          <a className="btn btn--lg" href={href('/')}>
            {T.home}
          </a>
          <a className="btn btn--ghost btn--lg" href={href('/blog')}>
            {T.blog}
          </a>
          <a className="btn btn--ghost btn--lg" href={href('/careers')}>
            {T.careers}
          </a>
        </div>
      </div>
    </PageShell>
  );
}
