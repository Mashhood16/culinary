import fs from "node:fs/promises";

const DATA_PATH = "./recipes-data.json";
const FALLBACK_IMAGE = "/fallback-recipe.jpg";

function normalizeImageValue(image) {
  if (typeof image === "string") {
    const trimmed = image.trim();
    return trimmed;
  }

  if (image && typeof image === "object") {
    const direct =
      typeof image.url === "string" ? image.url :
      typeof image.src === "string" ? image.src :
      typeof image.image === "string" ? image.image :
      "";

    return direct.trim();
  }

  return "";
}

function isUsableImageValue(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return Boolean(trimmed) && (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed));
}

async function main() {
  console.log("🔄 Normalizing recipe image values...");

  const data = await fs.readFile(DATA_PATH, "utf8");
  const recipes = JSON.parse(data);
  let updated = 0;

  for (const recipe of recipes) {
    const imageValue = normalizeImageValue(recipe.image);

    if (!isUsableImageValue(imageValue)) {
      recipe.image = FALLBACK_IMAGE;
      updated++;
      continue;
    }

    recipe.image = imageValue;
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(recipes, null, 2));
  console.log(`✅ Updated ${updated} recipe image values to use direct URLs or fallback placeholders.`);
}

main().catch((err) => console.error(err));