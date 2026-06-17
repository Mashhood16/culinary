import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  // Create response
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Set the cookie removal parameters directly on the response instance
  response.cookies.set('admin_session', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  });

  return response;
}