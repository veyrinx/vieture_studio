import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api.ts';
import { useAdmin } from '../../state/AdminContext.tsx';
import { PageHead } from '../../ui/PageHead.tsx';
import { PageError } from '../../ui/PageError.tsx';
import { useLoad } from '../../ui/useLoad.ts';
import { JobsPanel } from './JobsPanel.tsx';
import { ApplicationCard } from './ApplicationCard.tsx';
import { STAGES, fmtInterview, type Row } from './recruit.ts';

/** Accent-insensitive text for searching ("nguyen" finds "Nguyễn"). */
const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const haystack = (a: Row) =>
  fold(
    [a.name, a.email, a.phone, a.jobTitle, a.message, a.note, a.profile?.currentRole, a.profile?.city, ...(a.profile?.skills ?? [])]
      .filter(Boolean)
      .join(' ')
  );

const nowLocal = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 16); // Vietnam time, like interview.at

export function Applications() {
  const { setBadges } = useAdmin();
  const { data, error } = useLoad(() => api<{ items: Row[] }>('/applications'));
  const [items, setItems] = useState<Row[]>([]);
  const [stage, setStage] = useState('');
  const [job, setJob] = useState('');
  const [q, setQ] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<'new' | 'rating' | 'interview'>('new');
  useEffect(() => {
    if (data) setItems(data.items);
  }, [data]);
  const fresh = items.filter((a) => a.status === 'new').length;
  useEffect(() => {
    if (data) setBadges({ newApps: fresh });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, fresh]);

  const shown = useMemo(() => {
    const words = fold(q).split(/\s+/).filter(Boolean);
    const list = items.filter(
      (a) =>
        (!stage || a.status === stage) &&
        (!job || a.jobId === job) &&
        (a.rating ?? 0) >= minRating &&
        (!words.length || words.every((w) => haystack(a).includes(w)))
    );
    if (sort === 'rating') return [...list].sort((x, y) => (y.rating ?? 0) - (x.rating ?? 0));
    if (sort === 'interview') return [...list].filter((a) => a.interview).sort((x, y) => x.interview!.at.localeCompare(y.interview!.at));
    return list;
  }, [items, stage, job, q, minRating, sort]);

  if (error) return <PageError message={error} />;
  if (!data) return null;

  const counts = new Map<string, number>();
  for (const a of items) counts.set(a.jobId, (counts.get(a.jobId) ?? 0) + 1);
  const jobs = [...new Map(items.map((a) => [a.jobId, a.jobTitle])).entries()];
  const now = nowLocal();
  const upcoming = items
    .filter((a) => a.interview && a.interview.at >= now && a.status !== 'rejected')
    .sort((x, y) => x.interview!.at.localeCompare(y.interview!.at))
    .slice(0, 6);
  const update = (next: Row) => setItems((list) => list.map((x) => (x.id === next.id ? next : x)));
  const remove = (id: string) => setItems((list) => list.filter((x) => x.id !== id));

  return (
    <div>
      <PageHead title="Hồ sơ ứng tuyển" sub={`${items.length} hồ sơ · ${fresh} mới`}>
        <a className="btn btn--ghost btn--sm" href="/api/admin/applications.csv">
          Xuất CSV (Excel)
        </a>
      </PageHead>

      <JobsPanel counts={counts} />

      <div className="pipeline" role="tablist" aria-label="Giai đoạn tuyển dụng">
        <button type="button" role="tab" aria-selected={!stage} className={!stage ? 'is-on' : ''} onClick={() => setStage('')}>
          <b>{items.length}</b>
          <span>Tất cả</span>
        </button>
        {STAGES.map(([v, label]) => (
          <button type="button" role="tab" aria-selected={stage === v} className={`pipeline__${v}${stage === v ? ' is-on' : ''}`} key={v} onClick={() => setStage(stage === v ? '' : v)}>
            <b>{items.filter((a) => a.status === v).length}</b>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {upcoming.length > 0 && (
        <div className="panel">
          <h2>Lịch phỏng vấn sắp tới</h2>
          <ul className="upcoming">
            {upcoming.map((a) => (
              <li key={a.id}>
                <b>{fmtInterview(a.interview!.at)}</b>
                <span>
                  {a.name} — {a.jobTitle}
                </span>
                <span className="muted">{a.interview!.place}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="panel panel--tight">
        <div className="inline-form">
          <input type="search" value={q} placeholder="Tìm tên, email, SĐT, kỹ năng…" onChange={(e) => setQ(e.currentTarget.value)} />
          <select value={job} onChange={(e) => setJob(e.currentTarget.value)}>
            <option value="">Tất cả vị trí</option>
            {jobs.map(([id, title]) => (
              <option value={id} key={id}>
                {title}
              </option>
            ))}
          </select>
          <select value={minRating} onChange={(e) => setMinRating(Number(e.currentTarget.value))}>
            <option value={0}>Mọi đánh giá</option>
            {[3, 4, 5].map((n) => (
              <option value={n} key={n}>
                Từ {n} sao
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.currentTarget.value as typeof sort)}>
            <option value="new">Mới nhất</option>
            <option value="rating">Đánh giá cao nhất</option>
            <option value="interview">Theo lịch phỏng vấn</option>
          </select>
        </div>
      </div>

      {shown.length ? (
        <div className="inbox">
          {shown.map((a) => (
            <ApplicationCard a={a} key={a.id} onChange={update} onDelete={() => remove(a.id)} />
          ))}
        </div>
      ) : (
        <div className="panel">
          <p className="muted">{items.length ? 'Không có hồ sơ khớp bộ lọc.' : 'Chưa có hồ sơ nào.'}</p>
        </div>
      )}
    </div>
  );
}
