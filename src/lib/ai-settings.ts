import fs from 'fs';
import path from 'path';

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

// In-Memory Database Cache Variables to prevent disk read performance overhead
let cachedSettings: AISettings | null = null;
let lastReadTime = 0;
const CACHE_TTL = 3000; // Cache database parsed results in RAM for 3 seconds in production

export function getAISettings(): AISettings {
  const now = Date.now();
  
  // Only cache in production to ensure terminal updates/saves show instantly in development
  if (process.env.NODE_ENV === 'production' && cachedSettings && (now - lastReadTime < CACHE_TTL)) {
    return cachedSettings;
  }

  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultSettings, null, 2), 'utf8');
      return defaultSettings;
    }
    const data = { ...defaultSettings, ...JSON.parse(fs.readFileSync(filePath, 'utf8')) };
    cachedSettings = data;
    lastReadTime = now;
    return data;
  } catch {
    return defaultSettings;
  }
}

export function saveAISettings(settings: AISettings) {
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8');
  cachedSettings = settings;
  lastReadTime = Date.now();
  return settings;
}