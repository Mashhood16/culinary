import fs from "node:fs/promises";

const DATA_PATH = "./recipes-data.json";

async function main() {
  console.log("🔄 Resetting empty or placeholder image objects...");
  
  const data = await fs.readFile(DATA_PATH, "utf8");
  let recipes = JSON.parse(data);
  let resetCount = 0;

  for (const recipe of recipes) {
    // If the image is an object but has a placeholder or broken setup, clear it
    if (typeof recipe.image === 'object' && recipe.image !== null) {
      if (
        recipe.image.publicId === "placeholder-food-safe" || 
        !recipe.image.publicId || 
        recipe.image.publicId.includes("undefined")
      ) {
        recipe.image = ""; // Reset to empty string so the backfill script catches it
        resetCount++;
      }
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(recipes, null, 2));
  console.log(`✅ Successfully reset ${resetCount} broken entries back to empty strings.`);
}

main().catch(err => console.error(err));