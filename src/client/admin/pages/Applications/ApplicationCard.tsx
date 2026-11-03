import { useRef, useState } from 'react';
import { api, errMsg } from '../../lib/api.ts';
import { fmtTime } from '../../lib/path.ts';
import { useAdmin } from '../../state/AdminContext.tsx';
import { useToast } from '../../ui/Toast.tsx';
import { profileGroups, profileRows } from '../../../../shared/apply.ts';
import { STAGES, TEMPLATES, downloadIcs, fillTemplate, fmtInterview, stageLabel, type Row } from './recruit.ts';
import type { Interview } from '../../../../shared/types.ts';

/** Prints just this application (the browser's print dialog can also save it as PDF). */
function printApplication(el: HTMLDetailsElement | null) {
  if (!el) return;
  el.open = true;
  el.classList.add('is-printing');
  document.body.classList.add('printing');
  const done = () => {
    el.classList.remove('is-printing');
    document.body.classList.remove('printing');
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  window.print();
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

function Avatar({ a, size }: { a: Row; size: 'sm' | 'lg' }) {
  return a.hasPhoto ? (
    <img className={`avatar avatar--${size}`} src={`/api/admin/applications/${a.id}/photo`} alt="" loading="lazy" />
  ) : (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {initials(a.name)}
    </span>
  );
}

export function Stars({ value, onPick }: { value: number; onPick?: (n: number) => void }) {
  return (
    <span className={`stars${onPick ? ' stars--pick' : ''}`} aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onPick ? (
          <button type="button" key={n} className={n <= value ? 'is-on' : ''} title={`${n} sao`} onClick={() => onPick(n === value ? 0 : n)}>
            ★
          </button>
        ) : (
          <i key={n} className={n <= value ? 'is-on' : ''}>
            ★
          </i>
        )
      )}
    </span>
  );
}

const link = (v: string) => (/^https?:\/\//.test(v) ? <a href={v} target="_blank" rel="noopener noreferrer">{v}</a> : v);

function Profile({ a }: { a: Row }) {
  const rows = profileRows(a.profile);
  const groups = profileGroups(a.profile);
  const p = a.profile;
  if (!rows.length && !groups.length && !p?.objective) return null;
  return (
    <div className="cvbox">
      <dl className="cvbox__facts">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{link(v)}</dd>
          </div>
        ))}
      </dl>
      {p?.objective && (
        <>
          <h4>Mục tiêu nghề nghiệp</h4>
          <p className="cvbox__text">{p.objective}</p>
        </>
      )}
      {groups.map(([spec, lines]) => (
        <div key={spec.key}>
          <h4>{spec.title.vi}</h4>
          <ul className="cvbox__history">
            {lines.map((l, i) => (
              <li key={i}>
                <b>{l.head}</b>
                {l.body && <p>{l.body}</p>}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {p?.hobbies && (
        <>
          <h4>Sở thích</h4>
          <p className="cvbox__text">{p.hobbies}</p>
        </>
      )}
    </div>
  );
}

const EMPTY: Interview = { at: '', place: '', interviewer: '', note: '' };

export function ApplicationCard({ a, onChange, onDelete }: { a: Row; onChange: (a: Row) => void; onDelete: () => void }) {
  const { user, draft } = useAdmin();
  const toast = useToast();
  const box = useRef<HTMLDetailsElement>(null);
  const note = useRef<HTMLTextAreaElement>(null);
  const [iv, setIv] = useState<Interview>(a.interview ?? EMPTY);
  // the email that usually comes next at this stage
  const [tplId, setTplId] = useState(() => ({ new: 'received', reviewing: 'interview', interview: 'interview', passed: 'offer', offer: 'offer' })[a.status as string] ?? 'received');
  const [moveStage, setMoveStage] = useState(true);
  const company = draft.settings.siteName;

  const patch = async (body: Record<string, unknown>, msg: string) => {
    try {
      const r = await api<{ item: Row }>(`/applications/${a.id}`, { method: 'PATCH', body });
      onChange(r.item);
      toast(msg);
    } catch (e) {
      toast(errMsg(e));
    }
  };

  const tpl = TEMPLATES.find((t) => t.id === tplId)!;
  const rank = (st: string) => STAGES.findIndex(([v]) => v === st);
  // only suggest moving forward in the pipeline (or out of it)
  const suggest = tpl.status && (tpl.status === 'rejected' || rank(tpl.status) > rank(a.status)) ? tpl.status : null;
  const mail = fillTemplate(tpl, a, company, user.username);
  const sendMail = () => {
    if (tpl.needsInterview && !a.interview) return toast('Hãy lưu lịch phỏng vấn trước khi gửi thư mời.');
    location.href = `mailto:${encodeURIComponent(a.email)}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`;
    const body: Record<string, unknown> = { logText: `Gửi email: ${tpl.label}` };
    if (moveStage && suggest && suggest !== a.status) body.status = suggest;
    void patch(body, body.status ? `Đã mở email và chuyển sang "${stageLabel(suggest!)}".` : 'Đã mở email.');
  };

  return (
    <details className={`msg app${a.status === 'new' ? ' is-new' : ''}`} ref={box}>
      <summary>
        <Avatar a={a} size="sm" />
        <span className="app__who">
          <b>{a.name}</b>
          <span className="muted">{a.jobTitle}</span>
        </span>
        <Stars value={a.rating ?? 0} />
        {a.interview && a.status === 'interview' && <span className="app__chip">🗓 {fmtInterview(a.interview.at)}</span>}
        <span className={`pill pill--${a.status}`}>{stageLabel(a.status)}</span>
        <time className="muted">{fmtTime(a.at)}</time>
      </summary>

      <div className="msg__body">
        <div className="app__head">
          <Avatar a={a} size="lg" />
          <div>
            <h3>{a.name}</h3>
            <p className="muted">Ứng tuyển: {a.jobTitle}</p>
            <p>
              <a href={`mailto:${encodeURIComponent(a.email)}`}>{a.email}</a>
              {a.phone && (
                <>
                  {' · '}
                  <a href={`tel:${a.phone.replace(/[^\d+]/g, '')}`}>{a.phone}</a>
                </>
              )}
            </p>
            {a.cvLink && <p>Link CV: {link(a.cvLink)}</p>}
          </div>
        </div>

        <Profile a={a} />
        {a.message && (
          <>
            <h4 className="cvbox__h">Vì sao phù hợp</h4>
            <p className="msg__text">{a.message}</p>
          </>
        )}
        <p className="muted app__meta">{`Ngôn ngữ: ${a.lang} · IP: ${a.ip ?? '-'} · Đồng ý chính sách: ${a.consent ? 'có' : 'không'}`}</p>

        <div className="app__work">
          <section>
            <h4>Đánh giá & trạng thái</h4>
            <div className="app__row">
              <Stars value={a.rating ?? 0} onPick={(n) => patch({ rating: n }, n ? `Đã đánh giá ${n} sao.` : 'Đã bỏ đánh giá.')} />
              <select value={a.status} onChange={(e) => patch({ status: e.currentTarget.value }, 'Đã cập nhật trạng thái.')}>
                {STAGES.map(([v, t]) => (
                  <option value={v} key={v}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section>
            <h4>Lịch phỏng vấn</h4>
            <div className="app__grid">
              <label>
                Ngày giờ
                <input type="datetime-local" value={iv.at} onChange={(e) => setIv({ ...iv, at: e.currentTarget.value })} />
              </label>
              <label>
                Người phỏng vấn
                <input type="text" value={iv.interviewer} onChange={(e) => setIv({ ...iv, interviewer: e.currentTarget.value })} />
              </label>
              <label className="app__wide">
                Địa điểm / link họp online
                <input type="text" value={iv.place} placeholder="Văn phòng … hoặc https://meet.google.com/…" onChange={(e) => setIv({ ...iv, place: e.currentTarget.value })} />
              </label>
              <label className="app__wide">
                Lưu ý cho ứng viên
                <input type="text" value={iv.note} placeholder="Mang theo laptop, CCCD…" onChange={(e) => setIv({ ...iv, note: e.currentTarget.value })} />
              </label>
            </div>
            <div className="app__row">
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => patch({ interview: iv, ...(a.status === 'new' || a.status === 'reviewing' ? { status: 'interview' } : {}) }, 'Đã lưu lịch phỏng vấn.')}
              >
                Lưu lịch
              </button>
              {a.interview && (
                <>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => downloadIcs(a, a.interview!, company)}>
                    Thêm vào lịch (.ics)
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm danger"
                    onClick={() => {
                      setIv(EMPTY);
                      void patch({ interview: null }, 'Đã huỷ lịch phỏng vấn.');
                    }}
                  >
                    Huỷ lịch
                  </button>
                </>
              )}
            </div>
          </section>

          <section>
            <h4>Gửi email cho ứng viên</h4>
            <div className="app__row">
              <select value={tplId} onChange={(e) => setTplId(e.currentTarget.value)}>
                {TEMPLATES.map((t) => (
                  <option value={t.id} key={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              {suggest && suggest !== a.status && (
                <label className="app__check">
                  <input type="checkbox" checked={moveStage} onChange={(e) => setMoveStage(e.currentTarget.checked)} />
                  chuyển sang “{stageLabel(suggest)}”
                </label>
              )}
            </div>
            <pre className="app__mail">
              <b>{mail.subject}</b>
              {'\n\n'}
              {mail.body}
            </pre>
            <div className="app__row">
              <button type="button" className="btn btn--sm" onClick={sendMail}>
                Mở trong ứng dụng email
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => navigator.clipboard?.writeText(`${mail.subject}\n\n${mail.body}`).then(() => toast('Đã sao chép nội dung email.'))}
              >
                Sao chép nội dung
              </button>
            </div>
          </section>

          <section>
            <h4>Ghi chú nội bộ</h4>
            <textarea rows={3} defaultValue={a.note ?? ''} placeholder="Nhận xét sau phỏng vấn, điểm mạnh/yếu… (ứng viên không thấy)" ref={note} />
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => patch({ note: note.current!.value }, 'Đã lưu ghi chú.')}>
              Lưu ghi chú
            </button>
          </section>
        </div>

        {(a.log?.length ?? 0) > 0 && (
          <section className="app__log">
            <h4>Lịch sử</h4>
            <ol>
              {[...a.log!].reverse().map((l, i) => (
                <li key={i}>
                  <time className="muted">{fmtTime(l.at)}</time> <b>{l.by}</b> — {l.text}
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="msg__actions">
          {a.hasCv && (
            <a className="btn btn--sm" href={`/api/admin/applications/${a.id}/cv`}>
              Tải CV (PDF)
            </a>
          )}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => printApplication(box.current)}>
            In / Lưu PDF
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm danger"
            onClick={async () => {
              if (!confirm('Xoá hồ sơ này cùng file CV và ảnh vĩnh viễn?')) return;
              await api(`/applications/${a.id}`, { method: 'DELETE' });
              toast('Đã xoá.');
              onDelete();
            }}
          >
            Xoá hồ sơ
          </button>
        </div>
      </div>
    </details>
  );
}
