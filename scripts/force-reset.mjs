import fs from "node:fs/promises";

const DATA_PATH = "./recipes-data.json";
const FALLBACK_IMAGE = "/fallback-recipe.jpg";

function isUsableImageValue(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return Boolean(trimmed) && (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed));
}

async function main() {
  console.log("🔄 Resetting broken image entries...");

  const data = await fs.readFile(DATA_PATH, "utf8");
  const recipes = JSON.parse(data);
  let resetCount = 0;

  for (const recipe of recipes) {
    const imageValue = recipe.image;

    if (
      typeof imageValue === "object" && imageValue !== null &&
      (!isUsableImageValue(imageValue.url || "") &&
        !isUsableImageValue(imageValue.src || "") &&
        !isUsableImageValue(imageValue.image || ""))
    ) {
      recipe.image = FALLBACK_IMAGE;
      resetCount++;
      continue;
    }

    if (!isUsableImageValue(imageValue)) {
      recipe.image = FALLBACK_IMAGE;
      resetCount++;
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(recipes, null, 2));
  console.log(`✅ Successfully reset ${resetCount} broken entries to a safe fallback image.`);
}

main().catch((err) => console.error(err));