import { NextResponse } from 'next/server';
import { loadUsers } from '@/lib/user-store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users = await loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const sessionToken = `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    // 1. Create the response object first
    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });

    // 2. Set the cookie directly on the response instance (Required standard for Next.js Route Handlers)
    response.cookies.set('admin_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: true, // Securely transmitted over HTTPS
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}