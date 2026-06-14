import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/lib/ai-settings.json');

export type AISettings = {
  enabled: boolean;
  model: string;
  systemPrompt: string;
  apiKey: string;
};

const defaultSettings: AISettings = {
  enabled: true,
  model: 'meta-llama/llama-3.1-8b-instruct',
  systemPrompt: 'You are the AI Food Scientist for Culnarriest. Help users with recipe substitutions, ingredient swaps, scaling, flavor balance, dietary adaptations, and practical cooking tips. Keep answers concise, helpful, and recipe-focused. Prefer clear step-by-step advice, explain why substitutions work, preserve the dish identity, and avoid unsafe or invented cooking guidance. Respect dietary needs such as vegetarian, vegan, halal-friendly, gluten-free, dairy-free, and high-protein options.',
  apiKey: '',
};

export function getAISettings(): AISettings {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveAISettings(settings: AISettings) {
  fs.writeFileSync(filePath, JSON.stringify({ ...defaultSettings, ...settings }, null, 2), 'utf8');
  return getAISettings();
}
