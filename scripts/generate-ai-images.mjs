import fs from 'fs';
import path from 'path';

const recipesPath = path.join(process.cwd(), 'recipes-data.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

const UPLOAD_URL = 'https://culinary-umber-tau.vercel.app/api/admin/upload';
const COOKIE = 'admin_session=1';

async function generateAndUploadImage(recipe, current, total) {
  try {
    // 1. Generate image using Pollinations.ai
    // Note: nologo=true removes the watermark, and seed= ensures slightly different variations if retried
    const prompt = `A beautiful, professional, highly appetizing food photography shot of ${recipe.title}, ${recipe.cuisine} cuisine, studio lighting, highly detailed, 4k resolution`;
    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

    let imageRes;
    let retries = 3;
    while (retries > 0) {
      console.log(`[${current}/${total}] Generating image for ${recipe.title}...`);
      imageRes = await fetch(pollinationsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (imageRes.ok) break;
      if (imageRes.status === 429) {
        console.log(`[${current}/${total}] Rate limited (429). Waiting 30 seconds...`);
        await new Promise(r => setTimeout(r, 30000));
        retries--;
      } else {
        throw new Error(`Pollinations API failed with status ${imageRes.status}`);
      }
    }
    
    if (!imageRes || !imageRes.ok) throw new Error(`Pollinations API failed after retries`);
    
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload the generated image to Vercel Blob using the production API
    console.log(`[${current}/${total}] Uploading image for ${recipe.title}...`);
    
    // We construct a multipart/form-data request manually to avoid needing external dependencies
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const filename = `${recipe.slug}.jpg`;
    
    let body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`),
      Buffer.from(`Content-Type: image/jpeg\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const uploadRes = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Cookie': COOKIE,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: body
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      throw new Error(`Upload API failed with status ${uploadRes.status}: ${text}`);
    }

    const data = await uploadRes.json();
    if (!data.url) throw new Error(`No URL returned in response: ${JSON.stringify(data)}`);

    return data.url;

  } catch (error) {
    console.error(`[${current}/${total}] Error processing ${recipe.title}:`, error.message);
    return null;
  }
}

async function run() {
  let updatedCount = 0;
  
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const currentImage = typeof recipe.image === 'string' ? recipe.image : '';

    // Check if we already generated it in this run
    if (recipe.is_ai_generated) {
      continue;
    }

    const newUrl = await generateAndUploadImage(recipe, i + 1, recipes.length);
    if (newUrl) {
      recipe.image = newUrl;
      recipe.is_ai_generated = true;
      updatedCount++;
      
      // Save periodically to avoid losing progress
      if (updatedCount % 5 === 0) {
        fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2), 'utf8');
        console.log(`Saved progress: ${updatedCount} images updated so far.`);
      }
    }

    // Sleep longer to avoid rate limits
    await new Promise(r => setTimeout(r, 3000));
  }

  // Final save
  if (updatedCount > 0) {
    fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2), 'utf8');
    console.log(`\nDONE! Successfully generated and uploaded ${updatedCount} missing images.`);
  } else {
    console.log(`\nDONE! No missing images to generate.`);
  }
}

run();
