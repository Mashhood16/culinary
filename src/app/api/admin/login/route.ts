import { NextResponse } from 'next/server';
import { loadUsers } from '@/lib/user-store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Load users dynamically from the hybrid database
    const users = await loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate a unique session token
    const sessionToken = `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });

    // Set the secure, HttpOnly, SameSite cookie for session authorization
    response.cookies.set('admin_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // Expires in 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}