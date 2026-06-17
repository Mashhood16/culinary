import { NextResponse } from 'next/server';
// Gemini fallback is intentionally commented out. OpenRouter is now the active AI path.
// import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAISettings } from '@/lib/ai-settings';

export async function POST(request: Request) {
  try {
    // 1. Read both 'prompt' and 'type' from the client request payload
    const { prompt, type } = await request.json();

    const settings = await getAISettings();

    if (!settings.enabled) {
      return NextResponse.json({
        answer: 'AI assistance is currently disabled by the admin panel.'
      }, { status: 200 });
    }

    const question = typeof prompt === 'string' && prompt.trim().length > 0
      ? prompt.trim()
      : 'Give me 3 practical recipe adaptation ideas for a home cook.';

    const openRouterKey = String(process.env.OPENROUTER_API_KEY || '').trim();
    // const apiKey = String(
    //   settings.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''
    // ).trim();

    if (openRouterKey) {
      const modelName = settings.model || 'meta-llama/llama-3.1-8b-instruct';

      // 2. Select the correct system prompt based on the incoming request 'type'
      const systemPrompt = type === 'modify'
        ? settings.systemPromptModify || 'You are an expert food scientist. Adapt, scale, or substitute ingredients for the provided recipe accurately while maintaining flavor.'
        : settings.systemPrompt || 'You are a helpful recipe assistant.';

      const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://culnarriest.local',
          'X-Title': 'Culnarriest',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            // 3. Dynamically insert the resolved starting system prompt
            { role: 'system', content: systemPrompt }, 
            { role: 'user', content: question },
          ],
          temperature: 0.7,
        }),
      });

      if (!openRouterRes.ok) {
        const errorText = await openRouterRes.text();
        throw new Error(`OpenRouter error: ${openRouterRes.status} ${errorText}`);
      }

      const openRouterData = await openRouterRes.json();
      const answer = openRouterData.choices?.[0]?.message?.content || 'No answer returned.';
      return NextResponse.json({ answer }, { status: 200 });
    }

    if (!openRouterKey) {
      return NextResponse.json({
        answer: 'AI is not configured yet. Add OPENROUTER_API_KEY to enable live recipe-help suggestions.'
      }, { status: 200 });
    }

    // Gemini fallback path is disabled on purpose.
    // const genAI = new GoogleGenerativeAI(apiKey);
    // const preferredModels = [settings.model || 'gemini-1.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash'].filter(Boolean) as string[];
    // let lastError: unknown;
    // for (const modelName of preferredModels) {
    //   try {
    //     const model = genAI.getGenerativeModel({
    //       model: modelName,
    //       systemInstruction: settings.systemPrompt || undefined,
    //     });
    //     const result = await model.generateContent(question);
    //     return NextResponse.json({ answer: result.response.text() }, { status: 200 });
    //   } catch (error) {
    //     lastError = error;
    //     if (error instanceof Error && /404|429|quota|rate limit|too many requests|not found|unsupported/i.test(error.message)) {
    //       continue;
    //     }
    //     throw error;
    //   }
    // }
    // throw lastError ?? new Error('Unable to generate an AI response.');
  } catch (error) {
    console.error('AI route error:', error);

    const message = error instanceof Error && /openrouter/i.test(error.message)
      ? 'OpenRouter returned an error. Check your OPENROUTER_API_KEY and try again.'
      : 'I could not generate a response right now. Please try again in a moment or add your OpenRouter API key to enable live AI help.';

    return NextResponse.json({ answer: message }, { status: 500 });
  }
}