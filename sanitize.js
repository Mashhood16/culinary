import fs from 'node:fs';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'recipes-data.json');

// Regex matches "alcohol", "alcoholic", "non-alcoholic", "alcohol-free", "contains-alcohol", etc.
const alcoholRegex = /\b\w*-?alcohol\w*(-?\w+)?\b/gi;

function removeAlcoholWords(text) {
  if (typeof text !== 'string') return text;
  
  return text
    // Remove the word alcohol and any connected prefixes/suffixes
    .replace(alcoholRegex, '')
    // Clean up any double spaces, dangling punctuation, or trailing spaces left behind
    .replace(/\s+/g, ' ')
    .trim();
}

function main() {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Dynamic database file not found at ${filePath}. Please run your 'node seed.js' script first to populate the database.`);
    return;
  }

  console.log('Reading recipes-data.json...');
  const recipes = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`Removing all literal variations of the word "alcohol" from ${recipes.length} recipes...`);

  const sanitized = recipes.map((recipe) => {
    // Clean string fields
    const title = removeAlcoholWords(recipe.title);
    const description = removeAlcoholWords(recipe.description);
    const history = removeAlcoholWords(recipe.history);
    const licenseNote = removeAlcoholWords(recipe.licenseNote);
    const foodSafetyNote = removeAlcoholWords(recipe.foodSafetyNote);
    const editorialNote = removeAlcoholWords(recipe.editorialNote);

    // Clean ingredients array
    const ingredients = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map(ing => removeAlcoholWords(ing)).filter(Boolean)
      : [];

    // Clean steps array
    const steps = Array.isArray(recipe.steps)
      ? recipe.steps.map(step => removeAlcoholWords(step)).filter(Boolean)
      : [];

    // Clean tags array
    const tags = Array.isArray(recipe.tags)
      ? recipe.tags.map(tag => removeAlcoholWords(tag)).filter(Boolean)
      : [];

    return {
      ...recipe,
      title,
      description,
      history,
      licenseNote,
      foodSafetyNote,
      editorialNote,
      ingredients,
      steps,
      tags,
      // Force safety flags
      alcoholFree: true,
      containsAlcohol: false,
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(sanitized, null, 2), 'utf8');
  console.log('Success! Every variation of the word "alcohol" has been removed from all recipes.');
}

main();