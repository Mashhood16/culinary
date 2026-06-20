import fs from 'fs';
import path from 'path';

const recipesPath = path.join(process.cwd(), 'recipes-data.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

const LIVE_API_URL = 'https://culinary-umber-tau.vercel.app/api/admin/recipes';
const COOKIE = 'admin_session=1';

async function pushToLiveKV() {
  console.log('Fetching current live database state...');
  let liveRecipes = [];
  try {
    const res = await fetch(LIVE_API_URL, { headers: { 'Cookie': COOKIE } });
    if (res.ok) liveRecipes = await res.json();
  } catch (e) {
    console.log('Could not fetch live recipes, defaulting to push all.');
  }

  // Create a map of live recipes for quick comparison
  const liveMap = new Map(liveRecipes.map(r => [r.slug, r]));

  // Only push recipes that are marked as generated AND have a different image than what's live
  const toPush = recipes.filter(local => {
    if (!local.is_ai_generated && !(typeof local.image === 'string' && local.image.includes('blob.vercel-storage.com'))) {
      return false; // Not generated yet
    }
    
    const live = liveMap.get(local.slug);
    // If it doesn't exist live, or the image URL doesn't match, we need to push it!
    if (!live || live.image !== local.image) {
      return true;
    }
    
    return false; // Already perfectly synced!
  });
  
  if (toPush.length === 0) {
    console.log('\nEverything is already up to date! Nothing to sync.');
    return;
  }

  console.log(`Found ${toPush.length} new/unsynced recipes to push to Live KV...`);

  let pushed = 0;
  for (let i = 0; i < toPush.length; i++) {
    const recipe = toPush[i];
    
    try {
      const res = await fetch(LIVE_API_URL, {
        method: 'PUT',
        headers: {
          'Cookie': COOKIE,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipe)
      });
      
      if (res.ok) {
        pushed++;
        console.log(`[${i + 1}/${toPush.length}] Synced ${recipe.title} to Live KV`);
      } else {
        const err = await res.text();
        console.error(`[${i + 1}/${toPush.length}] Failed to sync ${recipe.title}: ${res.status} ${err}`);
      }
    } catch (e) {
      console.error(`[${i + 1}/${toPush.length}] Error syncing ${recipe.title}:`, e.message);
    }
    
    // Short delay to avoid rate limiting on our own API
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\nDONE! Pushed ${pushed} updated recipes to the live Vercel KV Database.`);
}

pushToLiveKV();
