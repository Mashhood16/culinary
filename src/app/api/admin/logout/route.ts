import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Imported next/headers

export const dynamic = 'force-dynamic';

export async function POST() {
  // Cleanly delete the cookie on the server using next/headers
  cookies().set('admin_session', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  });

  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}