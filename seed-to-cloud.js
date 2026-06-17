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