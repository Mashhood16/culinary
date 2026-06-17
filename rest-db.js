import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { kv } from '@vercel/kv';

async function resetDatabase() {
  const localPath = path.join(process.cwd(), 'recipes-data.json');
  
  // 1. Clear local file
  console.log('Clearing local recipes-data.json...');
  fs.writeFileSync(localPath, JSON.stringify([], null, 2), 'utf8');

  // 2. Clear Vercel KV cloud database
  console.log('Clearing Vercel KV cloud database...');
  try {
    await kv.del('recipes_data');
    console.log('✓ Cloud database wiped.');
  } catch (e) {
    console.error('Cloud wipe failed:', e);
  }

  console.log('Database reset complete. Please perform your Bulk Import again via the Admin Panel.');
}

resetDatabase();