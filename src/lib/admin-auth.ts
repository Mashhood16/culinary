import { createHmac, timingSafeEqual } from 'crypto';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'change-this-dev-secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@globalrecipehub.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function validateAdminLogin(email: string, password: string) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decode(value: string) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function sign(payload: string) {
  return createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}

export function createAdminSession(email: string) {
  const payload = encode({ email, exp: Date.now() + 1000 * 60 * 60 * 8 });
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(token: string | undefined) {
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = decode(payload) as { email?: string; exp?: number };
    if (!data.email || !data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}
