import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv'; // Official Vercel KV package

export type AISettings = {
  enabled: boolean;
  model: string;
  systemPrompt: string;       // Used for Pantry / Homepage AI
  systemPromptModify: string; // Used for Recipe Modifier Page AI
  systemPromptChat: string;   // Used for Continue Chat feature
  apiKey: string;
};

const filePath = path.join(process.cwd(), 'settings-data.json');
const isVercelKVActive = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Restored: Fallback settings object used during first-time initialization
const defaultSettings: AISettings = {
  enabled: true,
  model: 'meta-llama/llama-3.1-8b-instruct',
  systemPrompt: 'You are the AI Food Scientist for Culinarriest, a professional culinary assistant. When users list ingredients they have, suggest 3 realistic recipes they can make. For each recipe include: a clear title, step-by-step instructions, and smart ingredient substitutions. Explain the food science behind why substitutions work. Be concise, practical, and encouraging.',
  systemPromptModify: 'You are the AI Food Scientist for Culinarriest, an expert culinary scientist. Help users adapt recipes by: scaling servings up or down with accurate measurements, suggesting ingredient substitutions with explanations of how they affect flavor and texture, adjusting cooking times and temperatures, and offering dietary adaptations (vegan, gluten-free, dairy-free, etc.). Always explain the reasoning behind your suggestions.',
  systemPromptChat: 'You are the AI Food Scientist for Culinarriest, a friendly and knowledgeable culinary assistant. The user is continuing a conversation about recipes, ingredients, or cooking techniques. Maintain context from the previous messages and provide helpful, practical advice. Be concise, encouraging, and suggest actionable next steps.',
  apiKey: '',
};

export async function getAISettings(): Promise<AISettings> {
  if (isVercelKVActive) {
    try {
      const data = await kv.get<AISettings>('settings_data');
      
      if (!data) {
        console.log('Upstash settings are empty. Auto-seeding from settings-data.json...');
        try {
          if (fs.existsSync(filePath)) {
            const localData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as AISettings;
            await kv.set('settings_data', localData);
            return localData;
          }
        } catch (err: any) {
          console.error('Failed to auto-seed settings:', err.message);
        }
        return defaultSettings;
      }
      
      return data ? { ...defaultSettings, ...data } : defaultSettings;
    } catch (e) {
      console.error('Vercel KV settings read error:', e);
      return defaultSettings;
    }
  }

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
  if (isVercelKVActive) {
    try {
      await kv.set('settings_data', settings);
      return settings;
    } catch (e) {
      console.error('Vercel KV settings write error:', e);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8');
  return settings;
}