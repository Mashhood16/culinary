
import 'dotenv/config'; // Add this line
import fs from 'node:fs';
import path from 'node:path';

async function seedCloud() {
  const url = process.env.KV_REST_API_URL?.replace(/['"]/g, '');
  const token = process.env.KV_REST_API_TOKEN?.replace(/['"]/g, '');
  const localPath = path.join(process.cwd(), 'recipes-data.json');

  if (!url || !token) {
    console.error('KV credentials missing in .env.local');
    return;
  }

  if (!fs.existsSync(localPath)) {
    console.error('recipes-data.json not found!');
    return;
  }

  const recipes = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  console.log(`Uploading ${recipes.length} recipes to Upstash...`);

  const setRes = await fetch(`${url}/set/recipes_data`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(JSON.stringify(recipes))
  });

  if (setRes.ok) {
    console.log('✓ Successfully populated Upstash Cloud Database!');
  } else {
    console.error('Failed to upload to Upstash:', await setRes.text());
  }
}

seedCloud();
=======
import 'dotenv/config';
import fs from 'node:fs';
import { kv } from '@vercel/kv';

async function seed() {
  const data = JSON.parse(fs.readFileSync('./recipes-data.json', 'utf8'));
  console.log(`Starting upload of ${data.length} recipes...`);

  for (const recipe of data) {
    // Upload each recipe as its own key in the database
    // This bypasses the 1MB limit entirely
    await kv.set(`recipe:${recipe.slug}`, recipe);
    process.stdout.write('.'); 
  }
  
  // Save a list of all slugs so we know what to fetch
  const slugs = data.map(r => r.slug);
  await kv.set('all_recipe_slugs', slugs);
  
  console.log('\n✓ Cloud database synced perfectly.');
}
seed();
 