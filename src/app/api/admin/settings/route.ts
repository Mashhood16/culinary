import { NextResponse } from 'next/server';
import { getAISettings, saveAISettings } from '@/lib/ai-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = getAISettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Securely extract, sanitize, and type-cast each field of your AI configuration
    const settings = saveAISettings({
      enabled: Boolean(body.enabled),
      model: String(body.model || 'meta-llama/llama-3.1-8b-instruct'),
      systemPrompt: String(body.systemPrompt || '').trim(),
      systemPromptModify: String(body.systemPromptModify || '').trim(), // Added & sanitized
      apiKey: String(body.apiKey || '').trim(),
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}