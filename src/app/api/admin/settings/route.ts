import { NextResponse } from 'next/server';
import { getAISettings, saveAISettings } from '@/lib/ai-settings';

export const dynamic = 'force-dynamic';

/** Mask an API key: show only last 4 characters */
function maskApiKey(key: string): string {
  if (!key || key.length <= 8) return key ? '••••••••' : '';
  return '••••••••' + key.slice(-4);
}

export async function GET() {
  const settings = await getAISettings();
  return NextResponse.json({
    ...settings,
    apiKey: maskApiKey(settings.apiKey),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const settings = await saveAISettings({
      enabled: Boolean(body.enabled),
      model: String(body.model || 'meta-llama/llama-3.1-8b-instruct'),
      systemPrompt: String(body.systemPrompt || '').trim(),
      systemPromptModify: String(body.systemPromptModify || '').trim(),
      systemPromptChat: String(body.systemPromptChat || '').trim(),
      apiKey: String(body.apiKey || '').trim(),
    });

    return NextResponse.json({ ...settings, apiKey: maskApiKey(settings.apiKey) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
