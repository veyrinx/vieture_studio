// Structured job application (a full CV filled in on the site): choice lists and repeatable groups,
// shared by the site form, the server check, the admin view, CSV export and alerts.
import type { I18n } from './types.ts';

type Choices = Record<string, I18n>;

export const GENDERS: Choices = {
  male: { vi: 'Nam', en: 'Male' },
  female: { vi: 'Nữ', en: 'Female' },
  other: { vi: 'Khác', en: 'Other' },
};

export const LEVELS: Choices = {
  student: { vi: 'Sinh viên / mới tốt nghiệp', en: 'Student / fresh graduate' },
  lt1: { vi: 'Dưới 1 năm', en: 'Under 1 year' },
  y1_3: { vi: '1–3 năm', en: '1–3 years' },
  y3_5: { vi: '3–5 năm', en: '3–5 years' },
  gt5: { vi: 'Trên 5 năm', en: 'Over 5 years' },
};

export const EDUCATION: Choices = {
  highschool: { vi: 'THPT', en: 'High school' },
  college: { vi: 'Cao đẳng', en: 'College' },
  bachelor: { vi: 'Đại học', en: "Bachelor's degree" },
  master: { vi: 'Thạc sĩ trở lên', en: "Master's or higher" },
  other: { vi: 'Khác / tự học', en: 'Other / self-taught' },
};

/** Language proficiency (also used for the older single "English" field). */
export const ENGLISH: Choices = {
  basic: { vi: 'Cơ bản (đọc tài liệu)', en: 'Basic (reading docs)' },
  conversational: { vi: 'Giao tiếp được', en: 'Conversational' },
  fluent: { vi: 'Thành thạo', en: 'Fluent' },
  native: { vi: 'Như bản ngữ', en: 'Native' },
};

export const START: Choices = {
  now: { vi: 'Ngay lập tức', en: 'Immediately' },
  w2: { vi: 'Sau 2 tuần', en: 'In 2 weeks' },
  m1: { vi: 'Sau 1 tháng', en: 'In 1 month' },
  later: { vi: 'Thoả thuận', en: 'Negotiable' },
};

export const WORK_MODE: Choices = {
  office: { vi: 'Tại văn phòng', en: 'On-site' },
  hybrid: { vi: 'Linh hoạt (hybrid)', en: 'Hybrid' },
  remote: { vi: 'Làm từ xa', en: 'Remote' },
  any: { vi: 'Hình thức nào cũng được', en: 'Any' },
};

export const SOURCES: Choices = {
  website: { vi: 'Website VieTure Studio', en: 'VieTure Studio website' },
  facebook: { vi: 'Facebook', en: 'Facebook' },
  linkedin: { vi: 'LinkedIn', en: 'LinkedIn' },
  jobsite: { vi: 'Trang tuyển dụng (TopCV, ITviec…)', en: 'Job board (TopCV, ITviec…)' },
  referral: { vi: 'Bạn bè / người quen giới thiệu', en: 'Referral' },
  school: { vi: 'Trường học / sự kiện', en: 'School / event' },
  other: { vi: 'Khác', en: 'Other' },
};

// ---------- repeatable groups ----------
export interface GroupField {
  key: string;
  label: I18n;
  placeholder?: I18n;
  /** long text */
  area?: boolean;
  /** choice list (select) */
  choices?: Choices;
  max: number;
}
export interface GroupSpec {
  key: 'education' | 'certificates' | 'languages' | 'history' | 'projects' | 'references';
  title: I18n;
  hint?: I18n;
  add: I18n;
  max: number;
  /** the entry is kept only when this field is filled */
  main: string;
  fields: GroupField[];
}

export const GROUPS: Record<GroupSpec['key'], GroupSpec> = {
  education: {
    key: 'education',
    title: { vi: 'Quá trình học tập', en: 'Education history' },
    add: { vi: '+ Thêm trường học', en: '+ Add school' },
    max: 4,
    main: 'school',
    fields: [
      { key: 'school', label: { vi: 'Trường', en: 'School' }, max: 150 },
      { key: 'major', label: { vi: 'Chuyên ngành', en: 'Major' }, max: 120 },
      { key: 'period', label: { vi: 'Thời gian', en: 'Period' }, placeholder: { vi: '2018 – 2022', en: '2018 – 2022' }, max: 60 },
      { key: 'grade', label: { vi: 'Xếp loại / GPA', en: 'Grade / GPA' }, placeholder: { vi: 'Khá — 3.2/4', en: '3.2/4' }, max: 60 },
    ],
  },
  certificates: {
    key: 'certificates',
    title: { vi: 'Chứng chỉ & giải thưởng', en: 'Certificates & awards' },
    add: { vi: '+ Thêm chứng chỉ', en: '+ Add certificate' },
    max: 6,
    main: 'name',
    fields: [
      { key: 'name', label: { vi: 'Tên chứng chỉ / giải thưởng', en: 'Certificate / award' }, placeholder: { vi: 'AWS Cloud Practitioner, IELTS 7.0…', en: 'AWS Cloud Practitioner, IELTS 7.0…' }, max: 150 },
      { key: 'issuer', label: { vi: 'Đơn vị cấp', en: 'Issued by' }, max: 120 },
      { key: 'year', label: { vi: 'Năm', en: 'Year' }, max: 10 },
    ],
  },
  languages: {
    key: 'languages',
    title: { vi: 'Ngoại ngữ', en: 'Languages' },
    add: { vi: '+ Thêm ngoại ngữ', en: '+ Add language' },
    max: 4,
    main: 'name',
    fields: [
      { key: 'name', label: { vi: 'Ngôn ngữ', en: 'Language' }, placeholder: { vi: 'Tiếng Anh', en: 'English' }, max: 40 },
      { key: 'level', label: { vi: 'Trình độ', en: 'Level' }, choices: ENGLISH, max: 20 },
    ],
  },
  history: {
    key: 'history',
    title: { vi: 'Kinh nghiệm làm việc', en: 'Work experience' },
    hint: { vi: 'Bắt đầu từ công việc gần nhất.', en: 'Most recent first.' },
    add: { vi: '+ Thêm kinh nghiệm', en: '+ Add experience' },
    max: 6,
    main: 'company',
    fields: [
      { key: 'company', label: { vi: 'Công ty', en: 'Company' }, max: 120 },
      { key: 'role', label: { vi: 'Vị trí', en: 'Role' }, max: 120 },
      { key: 'period', label: { vi: 'Thời gian', en: 'Period' }, placeholder: { vi: '03/2024 – nay', en: '03/2024 – now' }, max: 60 },
      { key: 'desc', label: { vi: 'Công việc chính, thành tích', en: 'Responsibilities, achievements' }, area: true, max: 1500 },
    ],
  },
  projects: {
    key: 'projects',
    title: { vi: 'Dự án tiêu biểu', en: 'Key projects' },
    add: { vi: '+ Thêm dự án', en: '+ Add project' },
    max: 5,
    main: 'name',
    fields: [
      { key: 'name', label: { vi: 'Tên dự án', en: 'Project' }, max: 120 },
      { key: 'role', label: { vi: 'Vai trò', en: 'Your role' }, max: 120 },
      { key: 'tech', label: { vi: 'Công nghệ', en: 'Technology' }, max: 200 },
      { key: 'link', label: { vi: 'Link (nếu có)', en: 'Link (if any)' }, placeholder: { vi: 'https://', en: 'https://' }, max: 300 },
      { key: 'desc', label: { vi: 'Mô tả, kết quả', en: 'Description, results' }, area: true, max: 1500 },
    ],
  },
  references: {
    key: 'references',
    title: { vi: 'Người tham chiếu', en: 'References' },
    hint: { vi: 'Người có thể xác nhận về quá trình làm việc của bạn.', en: 'People who can vouch for your work.' },
    add: { vi: '+ Thêm người tham chiếu', en: '+ Add reference' },
    max: 3,
    main: 'name',
    fields: [
      { key: 'name', label: { vi: 'Họ tên', en: 'Name' }, max: 120 },
      { key: 'title', label: { vi: 'Chức vụ, công ty', en: 'Title, company' }, max: 150 },
      { key: 'contact', label: { vi: 'Email / SĐT', en: 'Email / phone' }, max: 150 },
    ],
  },
};

export type GroupItem = Record<string, string>;

export interface ApplicantProfile {
  gender?: string;
  birthDate?: string;
  /** older applications: year only */
  birthYear?: string;
  /** current address / city */
  city?: string;
  links?: string;
  objective?: string;
  level: string;
  currentRole?: string;
  education?: string;
  /** older applications: one school/major line */
  school?: string;
  skills: string[];
  /** older applications: single English level */
  english?: string;
  history: GroupItem[];
  educationList?: GroupItem[];
  certificates?: GroupItem[];
  languages?: GroupItem[];
  projects?: GroupItem[];
  references?: GroupItem[];
  salary?: string;
  start?: string;
  workMode?: string;
  hobbies?: string;
  source?: string;
}

/** Where each group is stored on the profile. */
export const GROUP_FIELD: Record<GroupSpec['key'], keyof ApplicantProfile> = {
  education: 'educationList',
  certificates: 'certificates',
  languages: 'languages',
  history: 'history',
  projects: 'projects',
  references: 'references',
};

/** Label of a choice code, or the code itself if unknown. */
export const choice = (list: Choices, code: string | undefined, lang: 'vi' | 'en' = 'vi') => (code ? (list[code]?.[lang] ?? code) : '');

const fmtDate = (d: string | undefined) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.split('-').reverse().join('/') : (d ?? ''));

/** The single-value parts of a profile as Vietnamese "label – value" rows (empty values left out). */
export function profileRows(p: ApplicantProfile | undefined): Array<[string, string]> {
  if (!p) return [];
  const rows: Array<[string, string]> = [
    ['Giới tính', choice(GENDERS, p.gender)],
    ['Ngày sinh', fmtDate(p.birthDate) || p.birthYear || ''],
    ['Địa chỉ', p.city ?? ''],
    ['LinkedIn / Portfolio', p.links ?? ''],
    ['Kinh nghiệm', choice(LEVELS, p.level)],
    ['Vị trí gần nhất', p.currentRole ?? ''],
    ['Học vấn', [choice(EDUCATION, p.education), p.school].filter(Boolean).join(' — ')],
    ['Kỹ năng', p.skills.join(', ')],
    ['Tiếng Anh', choice(ENGLISH, p.english)],
    ['Lương mong muốn', p.salary ?? ''],
    ['Có thể bắt đầu', choice(START, p.start)],
    ['Hình thức', choice(WORK_MODE, p.workMode)],
    ['Biết đến qua', choice(SOURCES, p.source)],
  ];
  return rows.filter(([, v]) => v);
}

/** One line per entry of a group, e.g. "Frontend Dev — ABC (2023 – nay)". */
export function groupLines(spec: GroupSpec, items: GroupItem[] | undefined): Array<{ head: string; body: string }> {
  return (items ?? []).map((it) => {
    const val = (f: GroupField) => (f.choices ? choice(f.choices, it[f.key]) : (it[f.key] ?? ''));
    const short = spec.fields.filter((f) => !f.area).map(val).filter(Boolean);
    const body = spec.fields.filter((f) => f.area).map(val).filter(Boolean).join('\n');
    return { head: short.join(' — '), body };
  });
}

/** Every filled group as [title, entries] (Vietnamese titles). */
export const profileGroups = (p: ApplicantProfile | undefined) =>
  Object.values(GROUPS)
    .map((spec) => [spec, groupLines(spec, p?.[GROUP_FIELD[spec.key]] as GroupItem[] | undefined)] as const)
    .filter(([, lines]) => lines.length);

/** Groups as plain text, for email and CSV. */
export const groupsText = (p: ApplicantProfile | undefined) =>
  profileGroups(p)
    .map(([spec, lines]) => `${spec.title.vi.toUpperCase()}\n${lines.map((l) => `• ${l.head}${l.body ? `\n  ${l.body.replace(/\n/g, '\n  ')}` : ''}`).join('\n')}`)
    .join('\n\n');

/** Older name kept for callers: work history as text. */
export const historyText = (p: ApplicantProfile | undefined) =>
  groupLines(GROUPS.history, p?.history)
    .map((l) => `${l.head}${l.body ? `\n${l.body}` : ''}`)
    .join('\n\n');
