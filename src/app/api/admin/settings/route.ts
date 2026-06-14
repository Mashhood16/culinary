import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getAISettings, saveAISettings } from '@/lib/ai-settings';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  if (!verifyAdminSession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(getAISettings());
}

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  if (!verifyAdminSession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const settings = saveAISettings({
    enabled: Boolean(body.enabled),
    model: String(body.model || 'meta-llama/llama-3.1-8b-instruct'),
    systemPrompt: String(body.systemPrompt || '').trim(),
    apiKey: String(body.apiKey || '').trim(),
  });

  return NextResponse.json(settings);
}
