import fs from "node:fs/promises";

const DATA_PATH = "./recipes-data.json";

async function main() {
  console.log("🧹 Initializing targeted reset for Chinese cuisine...");
  
  const data = await fs.readFile(DATA_PATH, "utf8");
  let recipes = JSON.parse(data);
  let resetCount = 0;

  for (const recipe of recipes) {
    // Check if the recipe belongs to American cuisine
    // (Adapting lowercase check to match how your data lists tags/cuisine types)
    if (
      recipe.cuisine?.toLowerCase() === "chinese" || 
      recipe.category?.toLowerCase() === "chinese" ||
      recipe.tags?.some(tag => tag.toLowerCase() === "chinese")
    ) {
      recipe.image = ""; // Completely wipe the image field
      resetCount++;
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(recipes, null, 2));
  
  console.log("\n==================================================");
  console.log(`🧹 RESET COMPLETE!`);
  console.log(`🗑️ Successfully cleared image strings for ${resetCount} Chinese recipes.`);
  console.log(`🔒 All other cuisines (Turkish, Italian, etc.) remain untouched.`);
  console.log("==================================================\n");
}

main().catch(err => console.error("💥 Reset failed:", err));