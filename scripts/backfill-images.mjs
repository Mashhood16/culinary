import "dotenv/config";
import fs from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";

// Ensure your recipes-data.json is here
const DATA_PATH = "./recipes-data.json";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  const data = await fs.readFile(DATA_PATH, "utf8");
  let recipes = JSON.parse(data);

  for (const recipe of recipes) {
    // Only process if image is a string (legacy) or missing publicId
    if (typeof recipe.image === 'string' && recipe.image.startsWith('http')) {
      console.log(`Uploading ${recipe.title}...`);
      try {
        const upload = await cloudinary.uploader.upload(recipe.image, {
          folder: "culinarriest/recipes",
          public_id: recipe.slug,
        });

        recipe.image = {
          publicId: upload.public_id,
          alt: recipe.title,
          status: 'approved'
        };
      } catch (e) {
        console.error(`Failed ${recipe.title}: ${e.message}`);
      }
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(recipes, null, 2));
  console.log("Migration complete!");
}

main();