import { NextResponse } from 'next/server';
import { createAdminSession, validateAdminLogin } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!validateAdminLogin(email, password)) {
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
  }

  const token = createAdminSession(email);

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
