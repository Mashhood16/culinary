import fs from 'node:fs/promises';
import { kv } from '@vercel/kv';

const DATA_PATH = './recipes-data.json';
const KV_KEY = 'recipes_data';

function dedupeRecipes(items) {
  const seen = new Set();
  const deduped = [];

  for (const item of items) {
    const slug = String(item?.slug || '').trim();
    const key = slug || JSON.stringify(item);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return deduped;
}

async function main() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  const recipes = JSON.parse(raw);

  if (!Array.isArray(recipes)) {
    throw new Error('recipes-data.json must contain an array of recipes.');
  }

  const cleaned = dedupeRecipes(recipes);

  await fs.writeFile(DATA_PATH, JSON.stringify(cleaned, null, 2), 'utf8');
  console.log(`✅ Wrote ${cleaned.length} recipes to local data store.`);

  const hasKV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  if (hasKV) {
    await kv.set(KV_KEY, cleaned);
    console.log(`✅ Synced ${cleaned.length} recipes to Vercel KV (${KV_KEY}).`);
  } else {
    console.log('ℹ️ Vercel KV is not configured, so only the local file was updated.');
  }
}

main().catch((error) => {
  console.error('Failed to sync recipe store:', error);
  process.exitCode = 1;
});
