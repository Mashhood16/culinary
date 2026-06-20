import { NextResponse } from 'next/server';
import { loadUsers } from '@/lib/user-store';
import { createHmac, randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter: max 5 attempts per 15 minutes per IP
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'change-this-dev-secret';

function createSessionToken(): string {
  // Use crypto.randomBytes for unpredictable session tokens
  const random = randomBytes(32).toString('hex');
  const timestamp = Date.now().toString(36);
  const payload = `${timestamp}.${random}`;
  const signature = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export async function POST(request: Request) {
  try {
    // Rate limit check
    const ip = getRateLimitKey(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users = await loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate a cryptographically secure session token with HMAC signature
    const sessionToken = createSessionToken();

    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });

    response.cookies.set('admin_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}