import fs from 'node:fs';
import path from 'node:path';

// Absolute path to the flat recipes catalogue file on your Windows system
const sourcePath = "C:\\Users\\mashh\\.gemini\\antigravity\\scratch\\global-recipe-hub\\complete_recipe_catalogue_node\\node_recipe_catalogue\\recipes-flat.json";
const targetPath = path.join(process.cwd(), 'recipes-data.json');

function main() {
  try {
    // 1. Check if the source flat JSON file exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`Error: Source file not found at: \n${sourcePath}\n\nPlease check the path and make sure 'recipes-flat.json' exists in that folder.`);
      return;
    }

    console.log(`Reading source file from: ${sourcePath}...`);
    const rawData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    const rawRecipes = rawData.recipes || [];

    if (!Array.isArray(rawRecipes) || rawRecipes.length === 0) {
      console.error('Error: No recipes array found in the source file.');
      return;
    }

    console.log(`Found ${rawRecipes.length} raw recipes. Converting to AdminRecipe format...`);

    // 2. Map the fields to your schema
    const formattedRecipes = rawRecipes.map((raw) => {
      const prepVal = raw.prepMinutes ? `${raw.prepMinutes} min` : '';
      const cookVal = raw.cookMinutes ? `${raw.cookMinutes} min` : '';
      const totalVal = raw.totalMinutes ? `${raw.totalMinutes} min` : '';

      return {
        slug: raw.id,
        title: raw.name || '',
        cuisine: raw.cuisine || 'Global',
        country: raw.cuisine || 'Global',
        mealType: raw.mealType || 'Dinner',
        foodType: raw.course || 'Main Course',
        description: raw.description || '',
        history: '',
        prepTime: prepVal,
        cookTime: cookVal,
        totalTime: totalVal,
        difficulty: raw.difficulty || 'Easy',
        servings: Number(raw.servings) || 2,
        rating: 5, // Default standard 5-star rating
        calories: '320 kcal',
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        image: raw.image || '', // Falls back to empty string if null
        alcoholFree: Array.isArray(raw.dietary) ? !raw.dietary.includes('contains-alcohol') : true,
        containsAlcohol: false,
        status: 'published', // Set to 'published' so they immediately display on public pages
        sourceType: 'Editorial',
        licenseNote: raw.sourceNote || '',
        foodSafetyNote: '',
        editorialNote: '',
        historyStatus: '',
        ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
        // Extract step text strings from the raw instructions objects
        steps: Array.isArray(raw.instructions) ? raw.instructions.map((stepObj) => stepObj.text) : [],
        featured: false,
      };
    });

    // 3. Load any existing database recipes first so you do not overwrite manual edits
    let existingRecipes = [];
    if (fs.existsSync(targetPath)) {
      try {
        existingRecipes = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      } catch {
        existingRecipes = [];
      }
    }

    // Combine lists, matching by slug to prevent duplicates
    const mergedMap = new Map();
    
    // Add existing recipes first
    for (const r of existingRecipes) {
      mergedMap.set(r.slug, r);
    }
    
    // Add the new seeded recipes (or overwrite if duplicate slug)
    for (const r of formattedRecipes) {
      mergedMap.set(r.slug, r);
    }

    const finalRecipes = Array.from(mergedMap.values());

    // 4. Save to recipes-data.json
    fs.writeFileSync(targetPath, JSON.stringify(finalRecipes, null, 2), 'utf8');
    console.log(`Success! Imported and merged recipes. Total records now in recipes-data.json: ${finalRecipes.length}`);

  } catch (error) {
    console.error('An error occurred during database seeding:', error.message);
  }
}

main();