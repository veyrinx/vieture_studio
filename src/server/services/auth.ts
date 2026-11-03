import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Request } from 'express';
import type { Role } from '../../shared/types.ts';

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEYLEN = 64;
const SESSION_TTL = 12 * 60 * 60 * 1000; // 12h, renewed on activity
export const COOKIE = 'vt_admin';
export const ROLES: Role[] = ['admin', 'editor'];
export const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, hashB64] = String(stored).split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length);
  return timingSafeEqual(actual, expected);
}

// Used when a username does not exist, so the response time does not reveal that.
const DUMMY_HASH = await hashPassword(randomBytes(12).toString('hex'));
export const burnTime = (password: string) => verifyPassword(password, DUMMY_HASH);

export const generatePassword = () => randomBytes(12).toString('base64url');

export function checkPasswordStrength(pw: unknown): string | null {
  if (typeof pw !== 'string' || pw.length < 10) return 'Mật khẩu cần ít nhất 10 ký tự.';
  if (pw.length > 200) return 'Mật khẩu quá dài.';
  return null;
}

// ---------- sessions (in memory: a restart simply logs everyone out) ----------
const sessions = new Map<string, { username: string; expires: number }>();

export function createSession(username: string): string {
  const id = randomBytes(32).toString('base64url');
  sessions.set(id, { username, expires: Date.now() + SESSION_TTL });
  return id;
}

export function getSession(id: string | null) {
  const s = id ? sessions.get(id) : undefined;
  if (!s) return null;
  if (s.expires < Date.now()) {
    sessions.delete(id!);
    return null;
  }
  s.expires = Date.now() + SESSION_TTL;
  return s;
}

export const destroySession = (id: string) => sessions.delete(id);

export function destroyUserSessions(username: string, exceptId?: string) {
  for (const [id, s] of sessions) if (s.username === username && id !== exceptId) sessions.delete(id);
}

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function sessionCookie(req: Request, value: string, maxAgeMs: number): string {
  const secure = req.secure ? '; Secure' : '';
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(maxAgeMs / 1000)}${secure}`;
}

export const SESSION_TTL_MS = SESSION_TTL;
