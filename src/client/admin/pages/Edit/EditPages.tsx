import { useAdmin } from '../../state/AdminContext.tsx';
import { PageHead } from '../../ui/PageHead.tsx';
import { Field } from '../../fields/Field.tsx';
import { FieldBlock } from '../../fields/FieldGroup.tsx';
import { LINK_FIELDS, PRIVACY_FIELDS, SECTIONS, SETTINGS_FIELDS, textLabel, type FieldSpec } from '../../schema.ts';

function FieldsPage({ title, sub, fields, children }: { title: string; sub: string; fields: FieldSpec[]; children?: React.ReactNode }) {
  const { draft, epoch } = useAdmin();
  return (
    <div>
      <PageHead title={title} sub={sub} />
      <div className="editor editor--wide" key={epoch}>
        {fields.map((f) => (
          <FieldBlock obj={draft} f={f} key={f.key} />
        ))}
      </div>
      {children}
    </div>
  );
}

/** Text keys not shown under any homepage section (menu, footer…). */
function CommonTexts() {
  const { draft, epoch } = useAdmin();
  const used = new Set(SECTIONS.flatMap((s) => Object.keys(draft.text).filter((k) => (s.text ?? []).some((p) => k.startsWith(p)))));
  const rest = Object.keys(draft.text).filter((k) => !used.has(k));
  return (
    <div className="group" key={epoch}>
      <h3>Chữ chung (menu, chân trang…)</h3>
      {rest.map((k) => (
        <Field obj={draft.text} f={{ key: k, literal: true, label: textLabel(k), type: 'i18n' }} key={k} />
      ))}
    </div>
  );
}

export const Links = () => (
  <FieldsPage title="Menu & liên kết" sub="Menu chính, liên kết chân trang và mạng xã hội. Link tới mục trên trang dùng dạng #id (ví dụ #faq)." fields={LINK_FIELDS}>
    <CommonTexts />
  </FieldsPage>
);
export const Settings = () => <FieldsPage title="Thông tin & SEO" sub="Thông tin liên hệ hiển thị trên trang và nội dung cho Google." fields={SETTINGS_FIELDS} />;
export const PrivacyPage = () => <FieldsPage title="Chính sách bảo mật" sub="Nội dung trang /privacy." fields={PRIVACY_FIELDS} />;
