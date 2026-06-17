import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Instantly destroy the admin_session cookie by setting its maxAge to 0
  response.cookies.set('admin_session', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  });

  return response;
}