import { useAdmin } from '../../state/AdminContext.tsx';
import { useToast } from '../../ui/Toast.tsx';
import { setFocus } from '../../lib/focus.ts';
import { L } from '../../lib/path.ts';
import { SECTIONS } from '../../schema.ts';
import type { Job } from '../../../../shared/types.ts';

const SITE = location.origin;
const today = () => new Date().toISOString().slice(0, 10);
const jobState = (j: Job) => (j.open === false ? 'Đã đóng' : j.deadline && j.deadline < today() ? 'Hết hạn' : 'Đang tuyển');

const plain = (s: string) => s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*\*|[[\]]/g, '').trim();

/** Ready-to-post text for Facebook / Zalo / LinkedIn groups (the link shows the role's preview image). */
function postText(j: Job, url: string, company: string) {
  const v = (x: { vi: string } | undefined) => plain(x?.vi ?? '');
  const list = (xs: string[] | undefined) => (xs ?? []).map((x) => `• ${plain(x)}`).join('\n');
  const meta = [v(j.location) && `📍 ${v(j.location)}`, v(j.type) && `🕒 ${v(j.type)}`, v(j.salary) && `💰 ${v(j.salary)}`, j.deadline && `⏰ Hạn nộp: ${j.deadline.split('-').reverse().join('/')}`]
    .filter(Boolean)
    .join('\n');
  return [
    `🚀 ${company.toUpperCase()} TUYỂN DỤNG: ${v(j.title).toUpperCase()}`,
    meta,
    v(j.summary),
    j.requirements?.vi?.length ? `✅ Yêu cầu:\n${list(j.requirements.vi)}` : '',
    j.benefits?.vi?.length ? `🎁 Quyền lợi:\n${list(j.benefits.vi)}` : '',
    `👉 Ứng tuyển trực tuyến trong 5–10 phút (không bắt buộc CV):\n${url}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Job postings: create one, copy each role's public link to share, jump to its editor. */
export function JobsPanel({ counts }: { counts: Map<string, number> }) {
  const { draft: C, change, go } = useAdmin();
  const toast = useToast();
  const jobs = C.jobs ?? [];
  const copy = (text: string, done = 'Đã sao chép link.') =>
    navigator.clipboard?.writeText(text).then(
      () => toast(done),
      () => toast(text)
    );
  const edit = (job?: Job) => {
    setFocus('careers', job);
    go('content');
  };
  const create = () => {
    const spec = SECTIONS.find((s) => s.id === 'careers')!.fields!.find((f) => f.key === 'jobs')!;
    const job = spec.template!() as Job;
    (C.jobs ??= []).unshift(job);
    change();
    edit(job);
    toast('Đã tạo tin mới — điền thông tin rồi bấm Lưu.');
  };
  const links: Array<[string, string]> = [
    ['Trang tuyển dụng (tất cả vị trí)', `${SITE}/careers`],
    ['Link nhận CV tự do', `${SITE}/careers/general`],
  ];
  return (
    <div className="panel jobs-panel">
      <div className="jobs-panel__head">
        <div>
          <h2>Tin tuyển dụng</h2>
          <p className="muted">
            Bấm “Sao chép bài đăng” rồi dán lên Facebook, Zalo, LinkedIn — link tự hiện ảnh xem trước có logo và thông tin vị trí. Hồ sơ nộp qua link sẽ về trang này.
          </p>
        </div>
        <button type="button" className="btn btn--sm" onClick={create}>
          + Đăng tin tuyển dụng mới
        </button>
      </div>
      <ul className="jobs-panel__list">
        {jobs.map((j) => {
          const url = `${SITE}/careers/${encodeURIComponent(j.id)}`;
          const state = jobState(j);
          return (
            <li key={j.id}>
              <div className="jobs-panel__info">
                <b>{L(j.title) || 'Vị trí chưa đặt tên'}</b>
                <span className={`pill${state === 'Đang tuyển' ? '' : ' pill--off'}`}>{state}</span>
                <span className="muted">{counts.get(j.id) ?? 0} hồ sơ</span>
                {state === 'Đang tuyển' && <code>{url}</code>}
              </div>
              <div className="jobs-panel__actions">
                {state === 'Đang tuyển' && (
                  <>
                    <button type="button" className="btn btn--sm" onClick={() => copy(postText(j, url, C.settings.siteName), 'Đã sao chép bài đăng — dán vào Facebook / Zalo / LinkedIn.')}>
                      Sao chép bài đăng
                    </button>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => copy(url)}>
                      Sao chép link
                    </button>
                    <a className="btn btn--ghost btn--sm" href={url} target="_blank" rel="noopener">
                      Mở ↗
                    </a>
                  </>
                )}
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => edit(j)}>
                  Sửa
                </button>
              </div>
            </li>
          );
        })}
        {links.map(([label, url]) => (
          <li key={url}>
            <div className="jobs-panel__info">
              <b>{label}</b>
              {url.endsWith('/general') && <span className="muted">{counts.get('general') ?? 0} hồ sơ</span>}
              <code>{url}</code>
            </div>
            <div className="jobs-panel__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => copy(url)}>
                Sao chép link
              </button>
              <a className="btn btn--ghost btn--sm" href={url} target="_blank" rel="noopener">
                Mở ↗
              </a>
            </div>
          </li>
        ))}
      </ul>
      {!jobs.length && <p className="muted">Chưa có tin nào — bấm “Đăng tin tuyển dụng mới”. Tin chỉ hiện trên web sau khi bấm Lưu.</p>}
    </div>
  );
}
