import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv'; // Official Vercel KV package

export type AISettings = {
  enabled: boolean;
  model: string;
  systemPrompt: string;       // Used for Pantry / Homepage AI
  systemPromptModify: string; // Used for Recipe Modifier Page AI
  apiKey: string;
};

const filePath = path.join(process.cwd(), 'settings-data.json');

const defaultSettings: AISettings = {
  enabled: true,
  model: 'meta-llama/llama-3.1-8b-instruct',
  systemPrompt: 'You are a creative pantry chef. Suggest 3 realistic recipes using only the user’s ingredients, and explain easy substitutions.',
  systemPromptModify: 'You are an expert food scientist. Adapt, scale, or substitute ingredients for the provided recipe accurately while maintaining flavor.',
  apiKey: '',
};

const isVercelKVActive = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export async function getAISettings(): Promise<AISettings> {
  // If running on Vercel with KV linked, load from the cloud database
  if (isVercelKVActive) {
    try {
      const data = await kv.get<AISettings>('settings_data');
      return data ? { ...defaultSettings, ...data } : defaultSettings;
    } catch (e) {
      console.error('Vercel KV settings read error:', e);
      return defaultSettings;
    }
  }

  // Local fallback: read file from disk
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultSettings, null, 2), 'utf8');
      return defaultSettings;
    }
    return { ...defaultSettings, ...JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch {
    return defaultSettings;
  }
}

export async function saveAISettings(settings: AISettings) {
  // If running on Vercel with KV linked, write to the cloud database
  if (isVercelKVActive) {
    try {
      await kv.set('settings_data', settings);
      return settings;
    } catch (e) {
      console.error('Vercel KV settings write error:', e);
    }
  }

  // Local fallback: save file directly to disk
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8');
  return settings;
}