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

export function loadSettings(): AISettings {
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

export function saveSettings(settings: AISettings) {
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8');
  return settings;
}