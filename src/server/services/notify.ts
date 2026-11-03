// Instant alerts for new contact requests and job applications via a Telegram bot.
//   TELEGRAM_BOT_TOKEN — from @BotFather
//   TELEGRAM_CHAT_ID   — your user/group id (several: comma-separated)
import { escapeHtml } from '../../shared/rich.ts';

const token = () => process.env.TELEGRAM_BOT_TOKEN?.trim() ?? '';
const chats = () => (process.env.TELEGRAM_CHAT_ID ?? '').split(',').map((x) => x.trim()).filter(Boolean);

export const telegramReady = () => Boolean(token() && chats().length);

/** Sends an HTML-formatted message to every configured chat. Never throws; returns whether all were delivered. */
export async function notify(html: string): Promise<boolean> {
  if (!telegramReady()) return false;
  const results = await Promise.all(
    chats().map(async (chat_id) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id, text: html.slice(0, 4000), parse_mode: 'HTML', link_preview_options: { is_disabled: true } }),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) console.error('[notify] telegram:', res.status, (await res.text()).slice(0, 200));
        return res.ok;
      } catch (err) {
        console.error('[notify] telegram failed:', (err as Error).message);
        return false;
      }
    })
  );
  return results.every(Boolean);
}

/** "label: value" lines, skipping empty values. */
export const lines = (pairs: Array<[string, string | undefined]>) =>
  pairs
    .filter(([, v]) => v)
    .map(([k, v]) => `<b>${escapeHtml(k)}:</b> ${escapeHtml(v!)}`)
    .join('\n');

export const quote = (text: string, max = 1500) => (text ? `\n\n<blockquote>${escapeHtml(text.slice(0, max))}${text.length > max ? '…' : ''}</blockquote>` : '');
