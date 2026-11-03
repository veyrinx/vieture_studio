// Recruitment workflow helpers for the admin: pipeline stages, email templates, calendar file.
import type { Application, ApplicationStatus, Interview } from '../../../../shared/types.ts';

export type Row = Omit<Application, 'cvFile' | 'photoFile'> & { hasCv: boolean; hasPhoto: boolean };

/** Pipeline stages in order (the last one is the "out" pile). */
export const STAGES: Array<[ApplicationStatus, string]> = [
  ['new', 'Mới'],
  ['reviewing', 'Đang xem xét'],
  ['interview', 'Phỏng vấn'],
  ['passed', 'Đạt phỏng vấn'],
  ['offer', 'Đề nghị nhận việc'],
  ['hired', 'Đã nhận việc'],
  ['rejected', 'Không phù hợp'],
];
export const stageLabel = (s: ApplicationStatus) => STAGES.find(([v]) => v === s)?.[1] ?? s;

/** "2026-10-20T09:30" → "09:30 thứ Hai, 20/10/2026" */
export function fmtInterview(at: string) {
  const [d, t] = at.split('T');
  const date = new Date(`${d}T00:00:00`);
  const wd = ['Chủ nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy'][date.getDay()];
  return `${t} ${wd}, ${d.split('-').reverse().join('/')}`;
}

// ---------- email templates ----------
export interface Template {
  id: string;
  label: string;
  /** status to suggest after sending */
  status?: ApplicationStatus;
  needsInterview?: boolean;
  subject: string;
  body: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'received',
    label: 'Xác nhận đã nhận hồ sơ',
    status: 'reviewing',
    subject: '[{company}] Đã nhận hồ sơ ứng tuyển {job}',
    body: `Chào {name},

Cảm ơn bạn đã quan tâm và ứng tuyển vị trí {job} tại {company}.
Chúng tôi đã nhận được hồ sơ của bạn và sẽ phản hồi trong vòng 5–7 ngày làm việc.

Trân trọng,
{sender}
{company}`,
  },
  {
    id: 'interview',
    label: 'Mời phỏng vấn',
    status: 'interview',
    needsInterview: true,
    subject: '[{company}] Thư mời phỏng vấn — {job}',
    body: `Chào {name},

Cảm ơn bạn đã ứng tuyển vị trí {job}. Chúng tôi trân trọng mời bạn tham gia buổi phỏng vấn:

• Thời gian: {time}
• Địa điểm / link: {place}
• Người phỏng vấn: {interviewer}
{interviewNote}
Bạn vui lòng phản hồi email này để xác nhận tham gia. Nếu thời gian chưa phù hợp, hãy đề xuất giúp chúng tôi khung giờ khác.

Trân trọng,
{sender}
{company}`,
  },
  {
    id: 'offer',
    label: 'Đề nghị nhận việc (offer)',
    status: 'offer',
    subject: '[{company}] Thư mời nhận việc — {job}',
    body: `Chào {name},

Chúc mừng bạn! Sau quá trình phỏng vấn, {company} rất vui được mời bạn đảm nhận vị trí {job}.

Chúng tôi sẽ gửi chi tiết về mức lương, chế độ và ngày bắt đầu trong thư đính kèm / buổi trao đổi tiếp theo.
Bạn vui lòng phản hồi trong vòng 3 ngày làm việc để xác nhận.

Rất mong được làm việc cùng bạn!

Trân trọng,
{sender}
{company}`,
  },
  {
    id: 'rejected',
    label: 'Thông báo chưa phù hợp',
    status: 'rejected',
    subject: '[{company}] Kết quả ứng tuyển vị trí {job}',
    body: `Chào {name},

Cảm ơn bạn đã dành thời gian ứng tuyển vị trí {job} tại {company}.
Sau khi cân nhắc kỹ, chúng tôi rất tiếc chưa thể tiếp tục với hồ sơ của bạn ở thời điểm này.

Chúng tôi sẽ lưu hồ sơ và liên hệ khi có vị trí phù hợp hơn. Chúc bạn nhiều thành công!

Trân trọng,
{sender}
{company}`,
  },
];

export function fillTemplate(tpl: Template, a: Row, company: string, sender: string) {
  const i = a.interview;
  const vars: Record<string, string> = {
    name: a.name,
    job: a.jobTitle,
    company,
    sender,
    time: i ? fmtInterview(i.at) : '(chưa đặt lịch)',
    place: i?.place || '(sẽ thông báo)',
    interviewer: i?.interviewer || company,
    interviewNote: i?.note ? `• Lưu ý: ${i.note}\n` : '',
  };
  const fill = (s: string) => s.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
  return { subject: fill(tpl.subject), body: fill(tpl.body) };
}

// ---------- calendar (.ics) ----------
const icsText = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
const icsTime = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Downloads an .ics event for the interview (times are Vietnam time, UTC+7). */
export function downloadIcs(a: Row, i: Interview, company: string) {
  const start = new Date(`${i.at}:00+07:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VieTure Studio//Recruitment//VI',
    'BEGIN:VEVENT',
    `UID:${a.id}@vieturestudio.com`,
    `DTSTAMP:${icsTime(new Date())}`,
    `DTSTART:${icsTime(start)}`,
    `DTEND:${icsTime(end)}`,
    `SUMMARY:${icsText(`Phỏng vấn ${a.name} — ${a.jobTitle}`)}`,
    `LOCATION:${icsText(i.place)}`,
    `DESCRIPTION:${icsText(`Ứng viên: ${a.name}\nEmail: ${a.email}\nSĐT: ${a.phone}\nNgười phỏng vấn: ${i.interviewer}\n${i.note}\n${company}`)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Phỏng vấn sau 30 phút',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: `phong-van-${a.name.replace(/\s+/g, '-')}.ics` });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
