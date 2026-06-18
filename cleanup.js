import fs from 'node:fs';
import path from 'node:path';

// Target string to remove
const targetString = ", written for consistent results and straightforward website use.";

// Native, zero-dependency environment variable parser
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('Reading database keys from .env.local...');
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim();
        }
      }
    });
  }
}

// Cleans the description string
function cleanText(text) {
  if (typeof text !== 'string') return text;
  return text.replace(targetString, '').trim();
}

async function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  try {
    console.log(`Processing: ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (filePath.endsWith('.json')) {
      const json = JSON.parse(content);
      
      const cleanRecipe = (r) => {
        if (r.description) r.description = cleanText(r.description);
        return r;
      };

      if (Array.isArray(json)) {
        // Formatted lists (e.g. recipes-flat.json / recipes-data.json)
        const cleaned = json.map(cleanRecipe);
        fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), 'utf8');
      } else if (json.recipes && Array.isArray(json.recipes)) {
        const cleaned = json.recipes.map(cleanRecipe);
        json.recipes = cleaned;
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
      } else if (json.cuisines && Array.isArray(json.cuisines)) {
        // Nested cuisine structures (e.g. recipes.json)
        json.cuisines.forEach((cuisine) => {
          if (cuisine.mealTypes && Array.isArray(cuisine.mealTypes)) {
            cuisine.mealTypes.forEach((mealType) => {
              if (mealType.recipes && Array.isArray(mealType.recipes)) {
                mealType.recipes = mealType.recipes.map(cleanRecipe);
              }
            });
          }
        });
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
      }
    } else {
      const cleanedText = content.split(targetString).join('');
      fs.writeFileSync(filePath, cleanedText, 'utf8');
    }
    console.log(`✓ Cleaned ${path.basename(filePath)} successfully.`);
  } catch (err) {
    console.error(`Error cleaning ${filePath}:`, err.message);
  }
}

async function cleanUpstash() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.log('\nSkipping Cloud Database cleanup: KV credentials are not set up in .env.local yet.');
    return;
  }

  try {
    console.log('\nConnecting to Upstash Redis Cloud Database...');
    const getUrl = `${url}/get/recipes_data`;
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    const getData = await getRes.json();

    if (getData.result) {
      const recipes = JSON.parse(getData.result);
      console.log(`Found ${recipes.length} recipes in Upstash. Cleaning descriptions...`);
      
      const cleaned = recipes.map((r) => {
        if (r.description) r.description = cleanText(r.description);
        return r;
      });

      console.log('Saving cleaned recipes back to Upstash Redis...');
      const setUrl = `${url}/set/recipes_data`;
      const setRes = await fetch(setUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(JSON.stringify(cleaned))
      });

      if (setRes.ok) {
        console.log('✓ Successfully cleaned Upstash Cloud DB!');
      } else {
        console.error('Failed to save cleaned recipes back to Upstash.');
      }
    } else {
      console.log('No recipes found in Upstash to clean.');
    }
  } catch (err) {
    console.error('Error cleaning Upstash Redis:', err.message);
  }
}

async function run() {
  loadEnvLocal();

  // Scans all possible local and absolute directory paths
  const paths = [
    path.join(process.cwd(), 'recipes-data.json'),
    path.join(process.cwd(), 'recipes-flat.json'),
    path.join(process.cwd(), 'recipes.json'),
    "C:\\Users\\mashh\\.gemini\\antigravity\\scratch\\global-recipe-hub\\complete_recipe_catalogue_node\\node_recipe_catalogue\\recipes-flat.json",
    "C:\\Users\\mashh\\.gemini\\antigravity\\scratch\\global-recipe-hub\\complete_recipe_catalogue_node\\node_recipe_catalogue\\recipes.json",
    "C:\\Users\\mashh\\.gemini\\antigravity\\scratch\\global-recipe-hub1\\global-recipe-hub\\recipes-flat.json",
    "C:\\Users\\mashh\\.gemini\\antigravity\\scratch\\global-recipe-hub1\\global-recipe-hub\\recipes.json",
    "C:\\Users\\mashh\\.gemini\\antigravity\\scratch\\global-recipe-hub1\\complete_recipe_catalogue_node\\node_recipe_catalogue\\recipes-flat.json",
    "C:\\Users\\mashh\\.gemini\\antigravity\\scratch\\global-recipe-hub1\\complete_recipe_catalogue_node\\node_recipe_catalogue\\recipes.json"
  ];

  console.log('Starting local cleanup tasks...');
  for (const p of paths) {
    await cleanFile(p);
  }

  // Cleans your production cloud database
  await cleanUpstash();
  console.log('\nAll cleanup tasks completed!');
}

run();