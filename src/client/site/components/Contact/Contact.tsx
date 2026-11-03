import { useState, type FormEvent } from 'react';
import { useHomeState, useSite } from '../../context.tsx';
import { Rich } from '../../ui/Rich.tsx';
import { Arrow } from '../../ui/Icon.tsx';
import { plainText } from '../../../../shared/rich.ts';
import { Section, useSection } from '../../ui/Section.tsx';
import { Channels } from './Channels.tsx';
import './Contact.css';

export function Contact() {
  const { C, L, t, lang } = useSite();
  const { eyebrow } = useSection();
  const { topic, setTopic } = useHomeState();
  const S = C.settings;
  const topics = [...C.services.map((s) => plainText(L(s.title))), plainText(t('form.other'))];
  const [status, setStatus] = useState<{ key: string; kind: 'error' | 'success' } | null>(null);
  const [sending, setSending] = useState(false);

  function mailtoFallback(data: Record<string, string>) {
    if (!S.email) return;
    const subject = `[${S.siteName}] ${plainText(t('form.mailSubject'))} — ${data.topic}`;
    const body = `${plainText(t('form.name'))}: ${data.name}\nEmail: ${data.email}\n${plainText(t('form.topic'))}: ${data.topic}\n\n${data.message}`;
    window.location.href = `mailto:${S.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const email = form.elements.namedItem('email') as HTMLInputElement;
    const consent = form.elements.namedItem('consent') as HTMLInputElement;
    if (!data.name.trim() || !email.checkValidity() || !data.email || data.message.trim().length < 10) return setStatus({ key: 'form.invalid', kind: 'error' });
    if (!consent.checked) {
      consent.focus();
      return setStatus({ key: 'form.needConsent', kind: 'error' });
    }
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lang, consent: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        form.reset();
        setTopic(0);
        setStatus({ key: 'form.ok', kind: 'success' });
      } else if (res.status === 429) setStatus({ key: 'form.limited', kind: 'error' });
      else if (res.status === 400) setStatus({ key: 'form.invalid', kind: 'error' });
      else throw new Error(json.error || res.status);
    } catch {
      // Server unreachable or mail failure — let the visitor send it themselves.
      setStatus({ key: 'form.fallback', kind: 'error' });
      mailtoFallback(data);
    } finally {
      setSending(false);
    }
  }

  return (
    <Section id="contact">
      <div className="container contact reveal">
        <div className="contact__info">
          <p className="eyebrow">{eyebrow(t('contact.eyebrow'))}</p>
          <Rich as="h2" text={t('contact.title')} />
          <Rich as="p" text={t('contact.desc')} />
          <ul className="contact__channels" id="contact-channels">
            <Channels />
          </ul>
        </div>
        <form className="form" id="contact-form" noValidate onSubmit={submit}>
          <div className="form__row">
            <label>
              <Rich text={t('form.name')} />
              <input name="name" type="text" required maxLength={120} autoComplete="name" placeholder={plainText(t('form.namePh'))} />
            </label>
            <label>
              <Rich text={t('form.email')} />
              <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder={plainText(t('form.emailPh'))} />
            </label>
          </div>
          <label>
            <Rich text={t('form.topic')} />
            <select name="topic" id="topic" value={topics[topic] ?? topics[0]} onChange={(e) => setTopic(e.target.selectedIndex)}>
              {topics.map((x, i) => (
                <option key={i}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <Rich text={t('form.message')} />
            <textarea name="message" rows={5} required minLength={10} maxLength={5000} placeholder={plainText(t('form.messagePh'))} />
          </label>
          <label className="form__consent">
            <input name="consent" type="checkbox" required />
            <Rich text={t('form.consent')} />
          </label>
          <label className="form__hp" aria-hidden="true">
            Website <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
          <button className="btn btn--lg btn--block" type="submit" disabled={sending}>
            <span>{plainText(t(sending ? 'form.sending' : 'form.submit'))}</span>
            <Arrow />
          </button>
          <p className="form__status" role="status" aria-live="polite" data-kind={status?.kind ?? ''}>
            {status ? plainText(t(status.key)) : ''}
          </p>
          <Rich as="p" className="form__note" text={t('form.note')} />
        </form>
      </div>
    </Section>
  );
}
