// Run: node scripts/push-to-kv.mjs
// This pushes your local recipes-data.json to Vercel KV

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@vercel/kv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local for KV credentials
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
  console.error('Missing KV_REST_API_URL or KV_REST_API_TOKEN in .env.local');
  process.exit(1);
}

const recipesPath = path.join(__dirname, '..', 'recipes-data.json');
if (!fs.existsSync(recipesPath)) {
  console.error('recipes-data.json not found. Run seed.js first or edit recipes via admin.');
  process.exit(1);
}

const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
console.log(`Loaded ${recipes.length} recipes from recipes-data.json`);

const kv = createClient({ url: KV_REST_API_URL, token: KV_REST_API_TOKEN });

await kv.set('recipes_data', recipes);
console.log('✅ Successfully pushed recipes_data to Vercel KV!');
console.log('Now redeploy your site and the steps should show correctly.');