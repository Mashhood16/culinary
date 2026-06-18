import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config'; // Make sure you have 'dotenv' installed
import { kv } from '@vercel/kv';

async function restore() {
  const localPath = path.join(process.cwd(), 'recipes-data.json');
  
  if (!fs.existsSync(localPath)) {
    console.error('recipes-data.json not found!');
    return;
  }

  const recipes = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  
  // Force every single recipe to be "published" and remove "deleted" status
  const restored = recipes.map(r => ({
    ...r,
    status: 'published'
  }));

  console.log(`Pushing ${restored.length} PUBLISHED recipes to Vercel KV...`);

  try {
    await kv.set('recipes_data', restored);
    console.log('✓ Database restored to published state.');
  } catch (err) {
    console.error('Error connecting to KV:', err);
  }
}

restore();