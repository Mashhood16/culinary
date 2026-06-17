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