import { NextResponse } from 'next/server';
import { loadSettings, saveSettings } from '@/lib/settings-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = loadSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = saveSettings(body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}