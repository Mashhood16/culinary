import "dotenv/config";
import fs from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";

const DATA_PATH = "./recipes-data.json";
const BATCH_SIZE = 5; 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPexelsWithRetry(query, retries = 3, delay = 4000) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query + " food")}&per_page=1`, {
        headers: { Authorization: apiKey }
      });

      if (res.status === 429) {
        console.log(`⚠️ Rate limit boundary hit for "${query}". Re-trying in ${delay / 1000}s... (Attempt ${i + 1}/${retries})`);
        await sleep(delay);
        continue;
      }

      const json = await res.json();
      return json.photos?.[0]?.src?.large || null;
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(delay);
    }
  }
  return null;
}

async function processRecipe(recipe) {
  if (typeof recipe.image === 'object' && recipe.image?.publicId) {
    return { status: "skipped" };
  }

  if (!recipe.image || recipe.image === "" || (typeof recipe.image === 'string' && !recipe.image.startsWith('http'))) {
    const pexelsUrl = await fetchPexelsWithRetry(recipe.title);
    if (pexelsUrl) {
      recipe.image = pexelsUrl;
    } else {
      // Direct asset fallback for terms completely locked out by Pexels rate filters
      console.log(`💡 Pexels bypassed for "${recipe.title}". Using clean generic stock path.`);
      recipe.image = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000";
    }
  }

  if (typeof recipe.image === 'string' && recipe.image.startsWith('http')) {
    try {
      console.log(`📤 Uploading to Cloudinary: "${recipe.title}"...`);
      const upload = await cloudinary.uploader.upload(recipe.image, {
        folder: "culinarriest/recipes",
        public_id: recipe.slug,
      });

      recipe.image = {
        publicId: upload.public_id,
        alt: recipe.title,
        status: 'approved'
      };
      return { status: "transformed" };
    } catch (e) {
      console.error(`❌ Cloudinary upload failed for "${recipe.title}":`, e.message);
      return { status: "failed" };
    }
  }
  return { status: "no_change" };
}

async function main() {
  console.log("🚀 Launching Smart Parallel Batching Pipeline...");
  
  const data = await fs.readFile(DATA_PATH, "utf8");
  let recipes = JSON.parse(data);
  
  let skipped = 0;
  let transformed = 0;
  let failed = 0;

  for (let i = 0; i < recipes.length; i += BATCH_SIZE) {
    const batch = recipes.slice(i, i + BATCH_SIZE);
    
    const needsProcessing = batch.some(r => !(typeof r.image === 'object' && r.image?.publicId));
    if (!needsProcessing) {
      skipped += batch.length;
      continue;
    }

    // Clean arithmetic: Display progress using the exact outer index state
    console.log(`\n📦 Processing Batch [Position: ${i}/${recipes.length} items evaluated]...`);
    
    const results = await Promise.all(batch.map(recipe => processRecipe(recipe)));
    
    results.forEach(res => {
      if (res.status === "skipped") skipped++; 
      if (res.status === "transformed") transformed++;
      if (res.status === "failed") failed++;
    });

    await fs.writeFile(DATA_PATH, JSON.stringify(recipes, null, 2));
    await sleep(2000); 
  }

  console.log("\n==================================================");
  console.log(`🏁 PIPELINE PROCESS COMPLETED`);
  console.log(`⏩ Skipped (Pre-Optimized): ${skipped}`);
  console.log(`🎉 Newly Transformed: ${transformed}`);
  console.log(`❌ Hard-Failed: ${failed}`);
  console.log(`📊 Total Object-Ready Records: ${skipped + transformed} / ${recipes.length}`);
  console.log("==================================================\n");
}

main().catch(err => console.error(err));