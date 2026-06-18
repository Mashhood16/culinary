import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Secure backend endpoint to upload raw file data to Vercel Blob
export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload the file securely to your linked Vercel Blob store
    const blob = await put(`recipes/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Blob upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}