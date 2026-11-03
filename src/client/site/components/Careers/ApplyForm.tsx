import { useRef, useState, type FormEvent } from 'react';
import { useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { plainText } from '../../../../shared/rich.ts';
import { EDUCATION, GENDERS, GROUP_FIELD, GROUPS, LEVELS, SOURCES, START, WORK_MODE, type ApplicantProfile, type GroupItem } from '../../../../shared/apply.ts';
import { RepeatGroup, readGroup } from './RepeatGroup.tsx';
import type { I18n } from '../../../../shared/types.ts';

const readFile = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

/** Portrait: cropped to 3:4 around the centre, 480×640, JPEG — small enough to send with the form. */
async function portrait(file: File): Promise<string> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const ratio = 3 / 4;
  let sw = bmp.width;
  let sh = bmp.height;
  if (sw / sh > ratio) sw = sh * ratio;
  else sh = sw / ratio;
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 640;
  canvas.getContext('2d')!.drawImage(bmp, (bmp.width - sw) / 2, (bmp.height - sh) / 2, sw, sh, 0, 0, 480, 640);
  bmp.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}

const ERRORS: Record<string, string> = {
  invalid: 'apply.invalid',
  rate_limited: 'apply.limited',
  file_too_big: 'apply.fileTooBig',
  file_type: 'apply.fileType',
};

const T = {
  vi: {
    steps: ['Thông tin cá nhân', 'Học vấn & kỹ năng', 'Kinh nghiệm & dự án', 'Mong muốn & gửi'],
    next: 'Tiếp tục →',
    back: '← Quay lại',
    photo: 'Ảnh chân dung',
    photoHint: 'Không bắt buộc · JPG/PNG, ảnh rõ mặt',
    photoPick: 'Chọn ảnh',
    photoChange: 'Đổi ảnh',
    photoRemove: 'Bỏ ảnh',
    photoBad: 'Không đọc được ảnh này — hãy chọn ảnh JPG hoặc PNG khác.',
    gender: 'Giới tính',
    birthDate: 'Ngày sinh',
    city: 'Địa chỉ hiện tại',
    cityPh: 'Quận/huyện, tỉnh/thành phố',
    links: 'LinkedIn / GitHub / Portfolio',
    objective: 'Mục tiêu nghề nghiệp',
    objectivePh: 'Mục tiêu ngắn hạn và dài hạn của bạn trong 1–3 năm tới.',
    education: 'Trình độ cao nhất',
    skills: 'Kỹ năng chính',
    skillsPh: 'Ví dụ: React, TypeScript, Figma (cách nhau bằng dấu phẩy)',
    level: 'Số năm kinh nghiệm',
    currentRole: 'Vị trí / công ty gần nhất',
    currentRolePh: 'Ví dụ: Frontend Developer tại ABC',
    salary: 'Mức lương mong muốn',
    salaryPh: 'Ví dụ: 15–20 triệu',
    start: 'Có thể bắt đầu',
    workMode: 'Hình thức làm việc',
    source: 'Bạn biết đến tin tuyển dụng qua',
    hobbies: 'Sở thích',
    message: 'Vì sao bạn phù hợp với vị trí này?',
    messagePh: 'Điểm mạnh của bạn và điều bạn mong muốn ở công việc này (tối thiểu 30 ký tự).',
    cvOptional: 'CV (không bắt buộc)',
    cvHint: 'Bạn đã điền đủ thông tin nên không cần gửi CV. Nếu có, bạn có thể đính kèm file PDF hoặc dán link.',
    choose: '— Chọn —',
    required: 'Vui lòng điền các ô có dấu *.',
    phone: 'Số điện thoại chưa đúng.',
    message30: 'Phần giới thiệu cần ít nhất 30 ký tự.',
    doneTitle: 'Đã nhận hồ sơ của bạn!',
    doneText: 'Cảm ơn bạn đã ứng tuyển. Chúng tôi sẽ xem hồ sơ và liên hệ qua email hoặc điện thoại nếu phù hợp.',
    again: 'Gửi hồ sơ khác',
  },
  en: {
    steps: ['Personal details', 'Education & skills', 'Experience & projects', 'Preferences & submit'],
    next: 'Continue →',
    back: '← Back',
    photo: 'Portrait photo',
    photoHint: 'Optional · JPG/PNG, face clearly visible',
    photoPick: 'Choose photo',
    photoChange: 'Change',
    photoRemove: 'Remove',
    photoBad: 'This image could not be read — please choose another JPG or PNG.',
    gender: 'Gender',
    birthDate: 'Date of birth',
    city: 'Current address',
    cityPh: 'District, city',
    links: 'LinkedIn / GitHub / Portfolio',
    objective: 'Career objective',
    objectivePh: 'Your short- and long-term goals for the next 1–3 years.',
    education: 'Highest education',
    skills: 'Key skills',
    skillsPh: 'e.g. React, TypeScript, Figma (comma-separated)',
    level: 'Years of experience',
    currentRole: 'Current / latest role',
    currentRolePh: 'e.g. Frontend Developer at ABC',
    salary: 'Expected salary',
    salaryPh: 'e.g. 15–20M VND',
    start: 'Can start',
    workMode: 'Work arrangement',
    source: 'How did you hear about this job?',
    hobbies: 'Hobbies',
    message: 'Why are you a good fit for this role?',
    messagePh: 'Your strengths and what you look for in this job (at least 30 characters).',
    cvOptional: 'CV (optional)',
    cvHint: 'You have filled in everything, so a CV is not required. If you have one, attach a PDF or paste a link.',
    choose: '— Select —',
    required: 'Please fill in the fields marked *.',
    phone: 'Please check your phone number.',
    message30: 'Your introduction needs at least 30 characters.',
    doneTitle: 'Application received!',
    doneText: 'Thank you for applying. We will review your profile and contact you by email or phone if it is a good fit.',
    again: 'Send another application',
  },
};

function Select({ name, label, options, required = false }: { name: string; label: string; options: Record<string, I18n>; required?: boolean }) {
  const { lang } = useSite();
  return (
    <label>
      <span>
        {label}
        {required && ' *'}
      </span>
      <select name={name} required={required} defaultValue="">
        <option value="">{T[lang].choose}</option>
        {Object.entries(options).map(([v, l]) => (
          <option value={v} key={v}>
            {l[lang]}
          </option>
        ))}
      </select>
    </label>
  );
}

function Text({ name, label, required = false, ...rest }: { name: string; label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label>
      <span>
        {label}
        {required && ' *'}
      </span>
      <input name={name} type="text" required={required} {...rest} />
    </label>
  );
}

const LAST = 3;

export function ApplyForm({ jobId }: { jobId: string }) {
  const { t, lang } = useSite();
  const L = T[lang];
  const form = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState('');
  const [status, setStatus] = useState<{ text: string; kind: 'error' | 'success' } | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0); // remounts the form (and its lists) after a submission
  const say = (text: string) => setStatus({ text, kind: 'error' });

  /** Checks one step; shows the browser's hint on the first invalid field. */
  const stepValid = (i: number) => {
    const fields = [...form.current!.querySelectorAll<HTMLInputElement>(`[data-step="${i}"] [name]`)];
    const bad = fields.find((f) => !f.checkValidity());
    if (bad) {
      setStep(i);
      requestAnimationFrame(() => bad.reportValidity());
      say(L.required);
      return false;
    }
    if (i === 0 && (form.current!.elements.namedItem('phone') as HTMLInputElement).value.replace(/\D/g, '').length < 8) {
      setStep(0);
      say(L.phone);
      return false;
    }
    if (i === LAST && String(new FormData(form.current!).get('message') ?? '').trim().length < 30) {
      say(L.message30);
      return false;
    }
    setStatus(null);
    return true;
  };

  const go = (i: number) => {
    setStep(i);
    requestAnimationFrame(() => form.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < LAST) {
      if (stepValid(step)) go(step + 1);
      return;
    }
    for (let i = 0; i <= LAST; i++) if (!stepValid(i)) return;
    const el = e.currentTarget;
    const fd = new FormData(el);
    const v = (k: string) => String(fd.get(k) ?? '').trim();
    if (!(el.elements.namedItem('consent') as HTMLInputElement).checked) return say(plainText(t('apply.needConsent')));
    const file = (el.elements.namedItem('cv') as HTMLInputElement).files?.[0];
    if (file && file.size > 5 * 1024 * 1024) return say(plainText(t('apply.fileTooBig')));
    if (file && !/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return say(plainText(t('apply.fileType')));

    const profile: ApplicantProfile = {
      gender: v('gender'),
      birthDate: v('birthDate'),
      city: v('city'),
      links: v('links'),
      objective: v('objective'),
      level: v('level'),
      currentRole: v('currentRole'),
      education: v('education'),
      skills: v('skills')
        .split(/[,;\n]/)
        .map((x) => x.trim())
        .filter(Boolean),
      history: [],
      salary: v('salary'),
      start: v('start'),
      workMode: v('workMode'),
      hobbies: v('hobbies'),
      source: v('source'),
    };
    for (const spec of Object.values(GROUPS)) (profile[GROUP_FIELD[spec.key]] as GroupItem[]) = readGroup(el, spec);

    const data: Record<string, unknown> = {
      jobId,
      name: v('name'),
      email: v('email'),
      phone: v('phone'),
      cvLink: v('cvLink'),
      message: v('message'),
      website: fd.get('website'),
      profile,
      photo: photo || undefined,
      consent: true,
      lang,
    };

    setSending(true);
    try {
      if (file) data.cv = await readFile(file);
      const res = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setStatus(null);
        setPhoto('');
        setDone(true);
      } else say(json.error === 'photo' ? L.photoBad : plainText(t(ERRORS[json.error] ?? 'apply.error')));
    } catch {
      say(plainText(t('apply.error')));
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="form jobdlg__form apply-done" role="status">
        <span className="apply-done__icon" aria-hidden="true">
          ✓
        </span>
        <h3>{L.doneTitle}</h3>
        <p>{L.doneText}</p>
        <button type="button" className="btn btn--ghost" onClick={() => (setDone(false), setStep(0), setRound((r) => r + 1))}>
          {L.again}
        </button>
      </div>
    );
  }

  return (
    <form className="form jobdlg__form apply" id="apply-form" noValidate onSubmit={submit} onInput={() => status && setStatus(null)} ref={form} key={round}>
      <Rich as="h3" text={t('careers.applyTitle')} />
      <ol className="apply__steps">
        {L.steps.map((s, i) => (
          <li key={s} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step ? '✓' : i + 1}</span>
            <b>{s}</b>
          </li>
        ))}
      </ol>
      <p className="apply__stepname">
        {lang === 'en' ? 'Step' : 'Bước'} {step + 1}/{L.steps.length} · <b>{L.steps[step]}</b>
      </p>

      <fieldset data-step="0" hidden={step !== 0}>
        <legend className="sr-only">{L.steps[0]}</legend>
        <div className="apply__photo">
          <div className="apply__photo-box">{photo ? <img src={photo} alt="" /> : <span aria-hidden="true">👤</span>}</div>
          <div>
            <p className="apply__label">
              {L.photo}
              <small>{L.photoHint}</small>
            </p>
            <label className="btn btn--ghost btn--sm apply__photo-btn">
              {photo ? L.photoChange : L.photoPick}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.currentTarget.files?.[0];
                  e.currentTarget.value = '';
                  if (!f) return;
                  try {
                    setPhoto(await portrait(f));
                  } catch {
                    say(L.photoBad);
                  }
                }}
              />
            </label>
            {photo && (
              <button type="button" className="apply__remove" onClick={() => setPhoto('')}>
                {L.photoRemove}
              </button>
            )}
          </div>
        </div>
        <Text name="name" label={plainText(t('apply.name'))} required maxLength={120} autoComplete="name" />
        <div className="form__row">
          <Select name="gender" label={L.gender} options={GENDERS} />
          <label>
            <span>{L.birthDate}</span>
            <input name="birthDate" type="date" min="1950-01-01" max={`${new Date().getFullYear() - 14}-12-31`} />
          </label>
        </div>
        <div className="form__row">
          <label>
            <span>{plainText(t('apply.email'))} *</span>
            <input name="email" type="email" required maxLength={200} autoComplete="email" />
          </label>
          <label>
            <span>{plainText(t('apply.phone'))} *</span>
            <input name="phone" type="tel" required maxLength={40} autoComplete="tel" />
          </label>
        </div>
        <Text name="city" label={L.city} maxLength={200} placeholder={L.cityPh} autoComplete="street-address" />
        <Text name="links" label={L.links} maxLength={300} placeholder="https://" />
        <label>
          <span>{L.objective}</span>
          <textarea name="objective" rows={3} maxLength={1500} placeholder={L.objectivePh} />
        </label>
      </fieldset>

      <fieldset data-step="1" hidden={step !== 1}>
        <legend className="sr-only">{L.steps[1]}</legend>
        <Select name="education" label={L.education} options={EDUCATION} />
        <RepeatGroup spec={GROUPS.education} start={1} />
        <Text name="skills" label={L.skills} maxLength={300} placeholder={L.skillsPh} />
        <RepeatGroup spec={GROUPS.languages} start={1} />
        <RepeatGroup spec={GROUPS.certificates} />
      </fieldset>

      <fieldset data-step="2" hidden={step !== 2}>
        <legend className="sr-only">{L.steps[2]}</legend>
        <div className="form__row">
          <Select name="level" label={L.level} options={LEVELS} required />
          <Text name="currentRole" label={L.currentRole} maxLength={150} placeholder={L.currentRolePh} />
        </div>
        <RepeatGroup spec={GROUPS.history} start={1} />
        <RepeatGroup spec={GROUPS.projects} />
      </fieldset>

      <fieldset data-step="3" hidden={step !== 3}>
        <legend className="sr-only">{L.steps[3]}</legend>
        <div className="form__row">
          <Text name="salary" label={L.salary} maxLength={80} placeholder={L.salaryPh} />
          <Select name="start" label={L.start} options={START} />
        </div>
        <div className="form__row">
          <Select name="workMode" label={L.workMode} options={WORK_MODE} />
          <Select name="source" label={L.source} options={SOURCES} />
        </div>
        <Text name="hobbies" label={L.hobbies} maxLength={500} />
        <RepeatGroup spec={GROUPS.references} />
        <label>
          <span>{L.message} *</span>
          <textarea name="message" rows={5} required minLength={30} maxLength={5000} placeholder={L.messagePh} />
        </label>
        <div className="apply__group">
          <p className="apply__label">
            {L.cvOptional}
            <small>{L.cvHint}</small>
          </p>
          <div className="form__row">
            <label>
              <span>PDF</span>
              <input name="cv" type="file" accept="application/pdf,.pdf" />
            </label>
            <label>
              <span>Link</span>
              <input name="cvLink" type="url" maxLength={500} placeholder="https://" />
            </label>
          </div>
        </div>
        <label className="form__consent">
          <input name="consent" type="checkbox" />
          <Rich text={t('apply.consent')} />
        </label>
      </fieldset>

      <label className="form__hp" aria-hidden="true">
        Website <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="apply__nav">
        {step > 0 && (
          <button type="button" className="btn btn--ghost" onClick={() => (setStatus(null), go(step - 1))}>
            {L.back}
          </button>
        )}
        <button className="btn btn--lg" type="submit" disabled={sending}>
          <span>{step < LAST ? L.next : plainText(t(sending ? 'apply.sending' : 'apply.submit'))}</span>
        </button>
      </div>
      <p className="form__status" role="status" aria-live="polite" data-kind={status?.kind ?? ''}>
        {status?.text ?? ''}
      </p>
    </form>
  );
}
