import { NextResponse } from 'next/server';
// Gemini fallback is intentionally commented out. OpenRouter is now the active AI path.
// import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAISettings } from '@/lib/ai-settings';

export async function POST(request: Request) {
  try {
    // 1. Read 'prompt', 'type', and optional 'history' from the client request payload
    const { prompt, type, history } = await request.json();

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

    if (openRouterKey) {
      const modelName = settings.model || 'meta-llama/llama-3.1-8b-instruct';

      // 2. Select the correct system prompt based on the incoming request 'type'
      let systemPrompt: string;
      if (type === 'modify') {
        systemPrompt = settings.systemPromptModify || 'You are an expert food scientist. Adapt, scale, or substitute ingredients for the provided recipe accurately while maintaining flavor.';
      } else if (type === 'chat') {
        systemPrompt = settings.systemPromptChat || 'You are a friendly culinary assistant. Maintain context from the previous conversation and provide helpful cooking advice.';
      } else {
        systemPrompt = settings.systemPrompt || 'You are a helpful recipe assistant.';
      }

      // 3. Build messages array with conversation history for context
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
      ];

      // Add previous conversation history if provided
      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({ role: msg.role, content: msg.content });
          }
        }
      }

      // Add the current user message
      messages.push({ role: 'user', content: question });

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
          messages,
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