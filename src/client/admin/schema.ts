// What the admin panel can edit, section by section.
// Field types:
//   i18n        {vi, en} single line          i18n-area   {vi, en} multi-line
//   i18n-lines  {vi: [..], en: [..]} one item per line
//   text / area plain string                  tags        string[] (comma separated)
//   icon        icon key from shared/icons.ts image       uploaded image URL
//   bool        checkbox                      list        array of objects (fields: [...])
//   date / select

/** Editable data is plain JSON; the editors read and write it by key path. */
export type Item = Record<string, any>;
export type LFn = (pair: unknown) => string;

export interface FieldSpec {
  key: string;
  label: string;
  type: 'i18n' | 'i18n-area' | 'i18n-lines' | 'text' | 'area' | 'tags' | 'icon' | 'image' | 'bool' | 'date' | 'select' | 'list';
  rows?: number;
  placeholder?: string;
  only?: string[];
  options?: Array<[string, string]>;
  /** list: one form per item */
  fields?: FieldSpec[];
  template?: () => Item;
  itemTitle?: (item: Item, L: LFn) => string;
  /** content.text keys like "hero.lead" contain dots but are one property */
  literal?: boolean;
}

export interface SectionSpec {
  id: string;
  label: string;
  fixed?: boolean;
  text?: string[];
  note?: string;
  fields?: FieldSpec[];
}

export interface CustomTypeSpec {
  type: 'text' | 'cards' | 'media' | 'cta' | 'gallery';
  label: string;
  desc: string;
  icon: string;
  template: () => Item;
  fields: FieldSpec[];
}

const i18n = (key: string, label: string, extra: Partial<FieldSpec> = {}): FieldSpec => ({ key, label, type: 'i18n', ...extra });
const area = (key: string, label: string, extra: Partial<FieldSpec> = {}): FieldSpec => ({ key, label, type: 'i18n-area', ...extra });
const lines = (key: string, label: string, extra: Partial<FieldSpec> = {}): FieldSpec => ({ key, label, type: 'i18n-lines', ...extra });
const tags = (key: string, label: string, extra: Partial<FieldSpec> = {}): FieldSpec => ({ key, label, type: 'tags', ...extra });
const icon = (key = 'icon', label = 'Icon'): FieldSpec => ({ key, label, type: 'icon' });

const titleDesc: FieldSpec[] = [icon(), i18n('title', 'Tiêu đề'), area('desc', 'Mô tả')];

export const SECTIONS: SectionSpec[] = [
  {
    id: 'hero',
    label: 'Đầu trang (Hero)',
    fixed: true,
    text: ['hero.'],
    fields: [tags('heroTags', 'Các thẻ nhỏ dưới nút'), lines('terminal', 'Dòng chữ trong khung terminal')],
  },
  { id: 'marquee', label: 'Dải công nghệ chạy ngang', fields: [tags('marquee', 'Các công nghệ')] },
  {
    id: 'about',
    label: 'Về chúng tôi',
    text: ['about.'],
    fields: [{ key: 'stats', label: 'Ô số liệu', type: 'list', itemTitle: (x, L) => `${x.value} — ${L(x.label)}`, template: () => ({ value: '1', label: { vi: '', en: '' } }), fields: [{ key: 'value', label: 'Giá trị (số sẽ có hiệu ứng đếm)', type: 'text' }, i18n('label', 'Nhãn')] }],
  },
  {
    id: 'audience',
    label: 'Chúng tôi phục vụ ai',
    text: ['audience.'],
    fields: [{ key: 'audience', label: 'Nhóm khách hàng', type: 'list', template: () => ({ icon: 'users', title: { vi: '', en: '' }, desc: { vi: '', en: '' }, points: { vi: [], en: [] } }), fields: [...titleDesc, lines('points', 'Ý chính')] }],
  },
  {
    id: 'services',
    label: 'Lĩnh vực hoạt động',
    text: ['services.'],
    note: 'Danh sách này cũng dùng cho bảng "Giải pháp chi tiết", ô chọn lĩnh vực trong form và chân trang.',
    fields: [
      {
        key: 'services',
        label: 'Lĩnh vực',
        type: 'list',
        template: () => ({ id: `svc-${Date.now().toString(36)}`, icon: 'star', title: { vi: '', en: '' }, desc: { vi: '', en: '' }, tags: [], items: { vi: [], en: [] }, stack: [] }),
        fields: [
          ...titleDesc,
          tags('tags', 'Thẻ trên card'),
          lines('items', 'Hạng mục tiêu biểu (bảng Giải pháp)'),
          tags('stack', 'Công nghệ thường dùng'),
          { key: 'id', label: 'Mã (dùng nội bộ, không dấu)', type: 'text' },
        ],
      },
    ],
  },
  { id: 'solutions', label: 'Giải pháp chi tiết (tab)', text: ['solutions.'], note: 'Nội dung từng tab lấy từ mục "Lĩnh vực hoạt động".' },
  {
    id: 'security',
    label: 'Tư vấn & dịch vụ bảo mật',
    text: ['sec.'],
    fields: [
      { key: 'security.services', label: 'Dịch vụ bảo mật', type: 'list', template: () => ({ icon: 'shield-check', title: { vi: '', en: '' }, desc: { vi: '', en: '' } }), fields: titleDesc },
      { key: 'security.steps', label: 'Quy trình', type: 'list', template: () => ({ title: { vi: '', en: '' }, desc: { vi: '', en: '' } }), fields: [i18n('title', 'Bước'), area('desc', 'Mô tả')] },
      lines('security.principles', 'Nguyên tắc làm việc'),
      lines('security.report', 'Báo cáo bàn giao gồm'),
      tags('security.severity', 'Mức độ rủi ro'),
    ],
  },
  { id: 'band', label: 'Dải kêu gọi tư vấn', text: ['band.'] },
  {
    id: 'why',
    label: 'Vì sao chọn chúng tôi',
    text: ['why.'],
    fields: [{ key: 'reasons', label: 'Lý do', type: 'list', template: () => ({ icon: 'star', title: { vi: '', en: '' }, desc: { vi: '', en: '' } }), fields: titleDesc }],
  },
  {
    id: 'process',
    label: 'Quy trình',
    text: ['process.'],
    fields: [{ key: 'steps', label: 'Các bước', type: 'list', template: () => ({ title: { vi: '', en: '' }, desc: { vi: '', en: '' } }), fields: [i18n('title', 'Bước'), area('desc', 'Mô tả')] }],
  },
  {
    id: 'projects',
    label: 'Dự án & sản phẩm',
    text: ['projects.'],
    note: 'Mục này tự ẩn khi chưa có dự án nào. Dự án có điền "Bài viết chi tiết", "Kết quả" hoặc "Thư viện ảnh" sẽ có trang case study riêng tại /projects/đường-dẫn (danh sách tất cả: /projects).',
    fields: [
      {
        key: 'projects',
        label: 'Dự án',
        type: 'list',
        itemTitle: (x, L) => L(x.title) || 'Dự án mới',
        template: () => ({ title: { vi: '', en: '' }, desc: { vi: '', en: '' }, tags: [], image: '', url: '', slug: '', client: { vi: '', en: '' }, year: '', industry: { vi: '', en: '' }, services: { vi: '', en: '' }, results: [], body: { vi: '', en: '' }, gallery: [] }),
        fields: [
          i18n('title', 'Tên dự án'),
          area('desc', 'Mô tả ngắn (hiện trên thẻ và đầu trang case study)'),
          tags('tags', 'Công nghệ / thẻ'),
          { key: 'image', label: 'Ảnh đại diện', type: 'image' },
          { key: 'url', label: 'Link sản phẩm thực tế (không bắt buộc)', type: 'text' },
          { key: 'slug', label: 'Đường dẫn trang case study (để trống = tự tạo từ tên, ví dụ: garment-erp)', type: 'text' },
          i18n('client', 'Khách hàng'),
          { key: 'year', label: 'Năm', type: 'text', placeholder: '2026' },
          i18n('industry', 'Lĩnh vực'),
          i18n('services', 'Hạng mục thực hiện (ví dụ: Thiết kế UI/UX, Web, App)'),
          {
            key: 'results',
            label: 'Kết quả nổi bật (con số)',
            type: 'list',
            itemTitle: (x, L) => `${x.value || ''} ${L(x.label) || ''}`.trim() || 'Kết quả mới',
            template: () => ({ value: '', label: { vi: '', en: '' } }),
            fields: [{ key: 'value', label: 'Con số (ví dụ: +40%, 3 tuần, 10k+)', type: 'text' }, i18n('label', 'Ý nghĩa')],
          },
          area('body', 'Bài viết chi tiết — định dạng như Blog: "## Tiêu đề", "- gạch đầu dòng", "> trích dẫn", "![chú thích](/uploads/anh.jpg)"', { rows: 14 }),
          {
            key: 'gallery',
            label: 'Thư viện ảnh',
            type: 'list',
            itemTitle: (x, L) => L(x.caption) || x.image || 'Ảnh mới',
            template: () => ({ image: '', caption: { vi: '', en: '' } }),
            fields: [{ key: 'image', label: 'Ảnh', type: 'image' }, i18n('caption', 'Chú thích')],
          },
        ],
      },
    ],
  },
  {
    id: 'tech',
    label: 'Công nghệ',
    text: ['tech.'],
    fields: [{ key: 'techGroups', label: 'Nhóm công nghệ', type: 'list', template: () => ({ name: { vi: '', en: '' }, items: [] }), fields: [i18n('name', 'Tên nhóm'), tags('items', 'Công nghệ')] }],
  },
  {
    id: 'engage',
    label: 'Hình thức hợp tác',
    text: ['engage.'],
    fields: [
      {
        key: 'engagement',
        label: 'Gói hợp tác',
        type: 'list',
        template: () => ({ featured: false, name: { vi: '', en: '' }, desc: { vi: '', en: '' }, best: { vi: '', en: '' }, points: { vi: [], en: [] } }),
        fields: [i18n('name', 'Tên'), area('desc', 'Mô tả'), i18n('best', 'Phù hợp khi'), lines('points', 'Ý chính'), { key: 'featured', label: 'Làm nổi bật gói này', type: 'bool' }],
      },
    ],
  },
  { id: 'mission', label: 'Sứ mệnh & Tầm nhìn', text: ['mission.', 'vision.'] },
  {
    id: 'values',
    label: 'Giá trị cốt lõi',
    text: ['values.'],
    fields: [{ key: 'values', label: 'Giá trị', type: 'list', template: () => ({ icon: 'star', name: '', desc: { vi: '', en: '' } }), fields: [icon(), { key: 'name', label: 'Tên', type: 'text' }, area('desc', 'Mô tả')] }],
  },
  { id: 'direction', label: 'Định hướng phát triển', text: ['direction.'] },
  {
    id: 'faq',
    label: 'Câu hỏi thường gặp',
    text: ['faq.'],
    fields: [{ key: 'faq', label: 'Câu hỏi', type: 'list', itemTitle: (x, L) => L(x.q), template: () => ({ q: { vi: '', en: '' }, a: { vi: '', en: '' } }), fields: [i18n('q', 'Câu hỏi'), area('a', 'Trả lời')] }],
  },
  {
    id: 'news',
    label: 'Tin tức (bài mới nhất)',
    text: ['news.'],
    note: 'Mục này hiện 3 bài viết mới nhất và tự ẩn khi chưa có bài. Viết bài ở trang "Blog / Tin tức" bên trái.',
  },
  {
    id: 'careers',
    label: 'Tuyển dụng',
    text: ['careers.', 'apply.'],
    note: 'Vị trí hết hạn nộp hoặc bỏ tích "Đang tuyển" sẽ tự ẩn. Hồ sơ ứng viên nằm ở mục "Hồ sơ ứng tuyển" bên trái. Ứng viên luôn có thể gửi CV tự do. Mỗi vị trí có trang riêng /careers/mã-vị-trí (Google có thể hiển thị trong mục Việc làm).',
    fields: [
      {
        key: 'jobs',
        label: 'Vị trí tuyển dụng',
        type: 'list',
        itemTitle: (x, L) => `${L(x.title) || 'Vị trí mới'}${x.open === false ? ' (đã đóng)' : ''}${x.deadline ? ' · hạn ' + x.deadline : ''}`,
        template: () => ({
          id: `job-${Date.now().toString(36)}`,
          open: true,
          title: { vi: '', en: '' },
          department: { vi: '', en: '' },
          location: { vi: '', en: '' },
          type: { vi: 'Toàn thời gian', en: 'Full-time' },
          salary: { vi: 'Thoả thuận', en: 'Negotiable' },
          deadline: '',
          posted: new Date().toISOString().slice(0, 10),
          summary: { vi: '', en: '' },
          description: { vi: '', en: '' },
          requirements: { vi: [], en: [] },
          benefits: { vi: [], en: [] },
        }),
        fields: [
          { key: 'open', label: 'Đang tuyển (bỏ tích để ẩn vị trí)', type: 'bool' },
          i18n('title', 'Tên vị trí'),
          i18n('department', 'Bộ phận'),
          i18n('location', 'Địa điểm (ví dụ: Hà Nội / Remote)'),
          i18n('type', 'Hình thức (Toàn thời gian, Bán thời gian, Thực tập…)'),
          i18n('salary', 'Mức lương'),
          { key: 'deadline', label: 'Hạn nộp hồ sơ (để trống = không giới hạn)', type: 'date' },
          { key: 'posted', label: 'Ngày đăng tin (hiện trên Google Jobs)', type: 'date' },
          area('summary', 'Tóm tắt ngắn (hiện trên thẻ)'),
          area('description', 'Mô tả công việc — mỗi dòng một đoạn, dòng bắt đầu "- " là gạch đầu dòng', { rows: 8 }),
          lines('requirements', 'Yêu cầu'),
          lines('benefits', 'Quyền lợi'),
          { key: 'id', label: 'Mã vị trí (dùng trong link /careers/mã, không dấu)', type: 'text' },
        ],
      },
    ],
  },
  { id: 'contact', label: 'Liên hệ & form', text: ['contact.', 'form.'] },
];

// ---------- Blocks the admin can add to the homepage ("+ Thêm khối mới") ----------
const empty = () => ({ vi: '', en: '' });
const buttonFields: FieldSpec[] = [i18n('button.label', 'Chữ trên nút (để trống = không có nút)'), { key: 'button.href', label: 'Link của nút (#muc, /trang hoặc https://...)', type: 'text' }];
const headFields: FieldSpec[] = [i18n('eyebrow', 'Nhãn mục (chữ nhỏ phía trên)'), i18n('title', 'Tiêu đề'), area('desc', 'Mô tả ngắn cạnh tiêu đề')];

export const CUSTOM_TYPES: CustomTypeSpec[] = [
  {
    type: 'text',
    label: 'Văn bản',
    desc: 'Tiêu đề, các đoạn văn và một nút bấm.',
    icon: 'book',
    template: () => ({ eyebrow: empty(), title: { vi: 'Tiêu đề mới', en: 'New title' }, desc: empty(), body: empty(), button: { label: empty(), href: '#contact' } }),
    fields: [...headFields, area('body', 'Nội dung (mỗi dòng một đoạn)'), ...buttonFields],
  },
  {
    type: 'cards',
    label: 'Lưới thẻ',
    desc: 'Nhiều thẻ có icon, tiêu đề, mô tả và link — như dịch vụ, tính năng, đối tác.',
    icon: 'layers',
    template: () => ({ eyebrow: empty(), title: { vi: 'Tiêu đề mới', en: 'New title' }, desc: empty(), items: [{ icon: 'star', title: { vi: 'Thẻ 1', en: 'Card 1' }, desc: empty(), url: '' }], button: { label: empty(), href: '' } }),
    fields: [
      ...headFields,
      { key: 'items', label: 'Thẻ', type: 'list', template: () => ({ icon: 'star', title: empty(), desc: empty(), url: '' }), fields: [icon(), i18n('title', 'Tiêu đề'), area('desc', 'Mô tả'), { key: 'url', label: 'Link (không bắt buộc)', type: 'text' }] },
      ...buttonFields,
    ],
  },
  {
    type: 'media',
    label: 'Ảnh + chữ',
    desc: 'Một ảnh lớn bên cạnh tiêu đề, đoạn văn và nút bấm.',
    icon: 'monitor-code',
    template: () => ({ eyebrow: empty(), title: { vi: 'Tiêu đề mới', en: 'New title' }, body: empty(), image: '', imageSide: 'left', button: { label: empty(), href: '' } }),
    fields: [
      { key: 'image', label: 'Ảnh', type: 'image' },
      { key: 'imageSide', label: 'Vị trí ảnh', type: 'select', options: [['left', 'Ảnh bên trái'], ['right', 'Ảnh bên phải']] },
      i18n('eyebrow', 'Nhãn mục (chữ nhỏ phía trên)'),
      i18n('title', 'Tiêu đề'),
      area('body', 'Nội dung (mỗi dòng một đoạn)'),
      ...buttonFields,
    ],
  },
  {
    type: 'cta',
    label: 'Dải kêu gọi',
    desc: 'Dải màu gradient nổi bật với một câu kêu gọi và nút bấm.',
    icon: 'zap',
    template: () => ({ title: { vi: 'Bạn đã sẵn sàng?', en: 'Ready to start?' }, desc: empty(), button: { label: { vi: 'Liên hệ ngay', en: 'Contact us' }, href: '#contact' } }),
    fields: [i18n('title', 'Tiêu đề'), area('desc', 'Mô tả'), ...buttonFields],
  },
  {
    type: 'gallery',
    label: 'Bộ sưu tập ảnh',
    desc: 'Lưới ảnh có chú thích — sản phẩm, sự kiện, văn phòng…',
    icon: 'layers',
    template: () => ({ eyebrow: empty(), title: { vi: 'Hình ảnh', en: 'Gallery' }, desc: empty(), items: [] }),
    fields: [...headFields, { key: 'items', label: 'Ảnh', type: 'list', itemTitle: (x, L) => L(x.caption) || x.image, template: () => ({ image: '', caption: empty() }), fields: [{ key: 'image', label: 'Ảnh', type: 'image' }, i18n('caption', 'Chú thích')] }],
  },
];

export const SETTINGS_FIELDS: FieldSpec[] = [
  { key: 'settings.siteName', label: 'Tên thương hiệu', type: 'text' },
  { key: 'settings.email', label: 'Email liên hệ (hiển thị + nhận form)', type: 'text' },
  { key: 'settings.phone', label: 'Số điện thoại', type: 'text', placeholder: '0901 234 567' },
  { key: 'settings.zalo', label: 'Zalo (số điện thoại hoặc link zalo.me)', type: 'text' },
  i18n('settings.address', 'Địa chỉ'),
  {
    key: 'settings.extraContacts',
    label: 'Kênh liên hệ khác (hiện ở mục Liên hệ và chân trang)',
    type: 'list',
    itemTitle: (x, L) => `${L(x.label)}${x.url ? ' → ' + x.url : ''}`,
    template: () => ({ icon: 'link', label: { vi: '', en: '' }, url: '' }),
    fields: [icon('icon', 'Biểu tượng'), i18n('label', 'Nội dung hiển thị (ví dụ: Hotline 2: 0909 000 000)'), { key: 'url', label: 'Link khi bấm (tel:..., mailto:..., https://..., để trống nếu chỉ hiển thị)', type: 'text' }],
  },
  { key: 'settings.floatingContact', label: 'Hiện nút Zalo / gọi điện nổi ở góc màn hình', type: 'bool' },
  i18n('settings.seo.title', 'Tiêu đề trang (Google, tab trình duyệt)'),
  area('settings.seo.description', 'Mô tả trang (Google, chia sẻ link) — nên dài 120–160 ký tự'),
  i18n('settings.seo.pages.blog.title', 'SEO trang Blog — tiêu đề (để trống = mặc định)'),
  area('settings.seo.pages.blog.description', 'SEO trang Blog — mô tả', { rows: 2 }),
  i18n('settings.seo.pages.projects.title', 'SEO trang Dự án — tiêu đề (để trống = mặc định)'),
  area('settings.seo.pages.projects.description', 'SEO trang Dự án — mô tả', { rows: 2 }),
  i18n('settings.seo.pages.careers.title', 'SEO trang Tuyển dụng — tiêu đề (để trống = mặc định)'),
  area('settings.seo.pages.careers.description', 'SEO trang Tuyển dụng — mô tả', { rows: 2 }),
  { key: 'settings.seo.google', label: 'Mã xác minh Google Search Console (dán cả thẻ <meta …> hoặc chỉ phần content)', type: 'text' },
  { key: 'settings.seo.bing', label: 'Mã xác minh Bing Webmaster (msvalidate.01)', type: 'text' },
];

const linkFields: FieldSpec[] = [i18n('label', 'Chữ hiển thị'), { key: 'href', label: 'Đường dẫn (#muc, /trang hoặc https://...)', type: 'text' }];

export const LINK_FIELDS: FieldSpec[] = [
  { key: 'settings.nav', label: 'Menu chính', type: 'list', itemTitle: (x, L) => `${L(x.label)} → ${x.href}`, template: () => ({ label: { vi: '', en: '' }, href: '#' }), fields: linkFields },
  { key: 'settings.footerLinks', label: 'Liên kết chân trang (cột "Công ty")', type: 'list', itemTitle: (x, L) => `${L(x.label)} → ${x.href}`, template: () => ({ label: { vi: '', en: '' }, href: '#' }), fields: linkFields },
  {
    key: 'settings.social',
    label: 'Mạng xã hội',
    type: 'list',
    itemTitle: (x) => `${x.label || x.icon} → ${x.url}`,
    template: () => ({ icon: 'facebook', label: 'Facebook', url: 'https://' }),
    fields: [
      { key: 'icon', label: 'Biểu tượng', type: 'icon', only: ['facebook', 'github', 'linkedin', 'youtube', 'tiktok', 'instagram', 'x', 'zalo', 'globe', 'mail', 'phone'] },
      { key: 'label', label: 'Tên', type: 'text' },
      { key: 'url', label: 'Link', type: 'text' },
    ],
  },
];

export const PRIVACY_FIELDS: FieldSpec[] = ['vi', 'en'].flatMap((lang): FieldSpec[] => [
  { key: `privacy.${lang}.title`, label: `Tiêu đề (${lang.toUpperCase()})`, type: 'text' },
  { key: `privacy.${lang}.intro`, label: `Đoạn mở đầu (${lang.toUpperCase()})`, type: 'area' },
  {
    key: `privacy.${lang}.sections`,
    label: `Các mục (${lang.toUpperCase()})`,
    type: 'list',
    itemTitle: (x) => x.title,
    template: () => ({ title: '', body: '' }),
    fields: [
      { key: 'title', label: 'Tiêu đề mục', type: 'text' },
      { key: 'body', label: 'Nội dung — mỗi dòng một đoạn, dòng bắt đầu bằng "- " là gạch đầu dòng', type: 'area', rows: 8 },
    ],
  },
]).concat([{ key: 'privacy.updated', label: 'Ngày cập nhật (YYYY-MM-DD)', type: 'text' }]);

// Friendly names for text keys (anything not listed shows its key).
export const TEXT_LABELS: Record<string, string> = {
  'hero.badge': 'Nhãn nhỏ phía trên',
  'hero.lead': 'Đoạn giới thiệu',
  'hero.cta1': 'Nút chính',
  'hero.cta2': 'Nút phụ',
  'hero.f1t': 'Ô nổi 1 — tiêu đề',
  'hero.f1d': 'Ô nổi 1 — mô tả',
  'hero.f2t': 'Ô nổi 2 — tiêu đề',
  'hero.f2d': 'Ô nổi 2 — mô tả',
  'hero.f3t': 'Ô nổi 3 — tiêu đề',
  'hero.f3d': 'Ô nổi 3 — mô tả',
  'hero.scroll': 'Nhãn nút cuộn xuống (đọc màn hình)',
  'nav.contact': 'Nút "Liên hệ" trên menu',
  'nav.menu': 'Nhãn nút mở menu (đọc màn hình)',
  'footer.tagline': 'Khẩu hiệu chân trang',
  'footer.services': 'Tiêu đề cột Lĩnh vực',
  'footer.company': 'Tiêu đề cột Công ty',
  'footer.contact': 'Tiêu đề cột Liên hệ',
  'footer.request': 'Link "Gửi yêu cầu" ở chân trang',
  'footer.rights': 'Dòng bản quyền',
  'footer.privacy': 'Link Chính sách bảo mật',
  totop: 'Nhãn nút về đầu trang',
  'projects.view': 'Chữ link "Xem chi tiết"',
  'solutions.deliver': 'Tiêu đề "Hạng mục tiêu biểu"',
  'solutions.stack': 'Tiêu đề "Công nghệ thường dùng"',
  'solutions.cta': 'Nút trong tab',
  'engage.best': 'Nhãn "Phù hợp khi"',
  'engage.cta': 'Nút trên mỗi gói',
  'sec.principles': 'Tiêu đề "Nguyên tắc làm việc"',
  'sec.process': 'Tiêu đề "Quy trình"',
  'sec.report': 'Tiêu đề "Báo cáo bàn giao"',
  'sec.severity': 'Nhãn mức độ rủi ro',
  'sec.cta': 'Nút yêu cầu đánh giá',
  'sec.note': 'Ghi chú cạnh nút',
  'band.cta': 'Nút',
  'mission.eyebrow': 'Sứ mệnh — nhãn',
  'mission.title': 'Sứ mệnh — tiêu đề',
  'mission.desc': 'Sứ mệnh — mô tả',
  'vision.eyebrow': 'Tầm nhìn — nhãn',
  'vision.title': 'Tầm nhìn — tiêu đề',
  'vision.desc': 'Tầm nhìn — mô tả',
  'form.name': 'Nhãn ô Họ tên',
  'form.namePh': 'Gợi ý trong ô Họ tên',
  'form.email': 'Nhãn ô Email',
  'form.emailPh': 'Gợi ý trong ô Email',
  'form.topic': 'Nhãn ô Lĩnh vực',
  'form.other': 'Lựa chọn "Khác"',
  'form.message': 'Nhãn ô Mô tả',
  'form.messagePh': 'Gợi ý trong ô Mô tả',
  'form.submit': 'Nút gửi',
  'form.sending': 'Chữ khi đang gửi',
  'form.note': 'Ghi chú dưới form',
  'form.consent': 'Ô đồng ý chính sách',
  'form.ok': 'Thông báo gửi thành công',
  'form.invalid': 'Lỗi thiếu thông tin',
  'form.needConsent': 'Lỗi chưa tích đồng ý',
  'form.limited': 'Lỗi gửi quá nhiều lần',
  'form.fallback': 'Lỗi không kết nối được',
  'form.mailSubject': 'Tiêu đề email dự phòng',
  'news.all': 'Nút "Xem tất cả bài viết"',
  'news.read': 'Chữ "phút đọc"',
  'careers.empty': 'Thẻ "Ứng tuyển tự do" — khi chưa có vị trí nào',
  'careers.generalOpen': 'Thẻ "Ứng tuyển tự do" — khi đang có vị trí',
  'careers.general': 'Nút gửi CV tự do',
  'careers.generalTitle': 'Tiêu đề thẻ ứng tuyển tự do',
  'careers.details': 'Nút xem chi tiết vị trí',
  'careers.deadline': 'Nhãn "Hạn nộp"',
  'careers.salary': 'Nhãn "Mức lương"',
  'careers.description': 'Tiêu đề "Mô tả công việc"',
  'careers.requirements': 'Tiêu đề "Yêu cầu"',
  'careers.benefits': 'Tiêu đề "Quyền lợi"',
  'careers.applyTitle': 'Tiêu đề form ứng tuyển',
  'careers.close': 'Nhãn nút đóng (đọc màn hình)',
};

export const textLabel = (key: string): string => {
  if (TEXT_LABELS[key]) return TEXT_LABELS[key];
  const part = key.split('.').slice(1).join('.');
  return (
    {
      eyebrow: 'Nhãn mục (chữ nhỏ)',
      title: 'Tiêu đề',
      desc: 'Mô tả',
      cta: 'Nút',
      p1: 'Đoạn 1',
      p2: 'Đoạn 2',
      quote: 'Câu trích',
    }[part] ?? key
  );
};
