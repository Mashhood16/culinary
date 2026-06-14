import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.argv[2] || 'C:/Users/mashh/Downloads/global_alcohol_free_recipe_catalog_320.json';
const outputPath = path.join(projectRoot, 'src/lib/recipe-catalog.json');

const cuisineCountries = {
  Afghan: 'Afghanistan',
  American: 'United States',
  'Arabian Gulf': 'Gulf Region',
  Australian: 'Australia',
  Bangladeshi: 'Bangladesh',
  Brazilian: 'Brazil',
  British: 'United Kingdom',
  Chinese: 'China',
  Egyptian: 'Egypt',
  Ethiopian: 'Ethiopia',
  Filipino: 'Philippines',
  French: 'France',
  German: 'Germany',
  Greek: 'Greece',
  Indian: 'India',
  Indonesian: 'Indonesia',
  Italian: 'Italy',
  Jamaican: 'Jamaica',
  Japanese: 'Japan',
  Korean: 'South Korea',
  Lebanese: 'Lebanon',
  Malaysian: 'Malaysia',
  Mexican: 'Mexico',
  Moroccan: 'Morocco',
  Nepali: 'Nepal',
  Nigerian: 'Nigeria',
  Pakistani: 'Pakistan',
  Persian: 'Iran',
  Peruvian: 'Peru',
  Polish: 'Poland',
  Russian: 'Russia',
  'South African': 'South Africa',
  Spanish: 'Spain',
  'Sri Lankan': 'Sri Lanka',
  Thai: 'Thailand',
  Turkish: 'Turkey',
  Ukrainian: 'Ukraine',
  'Uzbek and Central Asian': 'Central Asia',
  Vietnamese: 'Vietnam',
  Yemeni: 'Yemen',
};

const categoryImages = {
  'Bread or Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  'Curry or Stew': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80',
  Dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
  Drink: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80',
  'Grilled or Fried Main': 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80',
  'Main Course': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  'Pasta or Noodles': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',
  'Rice Dish': 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=900&q=80',
  'Salad or Cold Dish': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80',
  'Snack or Dumpling': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
  Soup: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
  'Vegetarian Main': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
};

const featuredImages = {
  'pakistani-chicken-biryani': 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=900&q=80',
  'italian-margherita-pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
  'turkish-lentil-soup': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
  'thai-green-curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=900&q=80',
  'mango-lassi': 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=900&q=80',
  'alcohol-free-mojito': 'https://images.unsplash.com/photo-1523379874101-1e5ba5d101f2?auto=format&fit=crop&w=900&q=80',
};

const mealTypeByCategory = {
  'Bread or Bakery': 'Bakery',
  'Curry or Stew': 'Dinner',
  Dessert: 'Dessert',
  Drink: 'Drink',
  'Grilled or Fried Main': 'Dinner',
  'Main Course': 'Dinner',
  'Pasta or Noodles': 'Dinner',
  'Rice Dish': 'Dinner',
  'Salad or Cold Dish': 'Lunch',
  'Snack or Dumpling': 'Snack',
  Soup: 'Lunch',
  'Vegetarian Main': 'Dinner',
};

const caloriesByCategory = {
  'Bread or Bakery': 340,
  'Curry or Stew': 390,
  Dessert: 310,
  Drink: 120,
  'Grilled or Fried Main': 430,
  'Main Course': 460,
  'Pasta or Noodles': 420,
  'Rice Dish': 480,
  'Salad or Cold Dish': 240,
  'Snack or Dumpling': 280,
  Soup: 260,
  'Vegetarian Main': 350,
};

function sentenceCaseTag(tag) {
  return String(tag)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatIngredient(ingredient) {
  return [ingredient.quantity, ingredient.unit, ingredient.item].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const recipes = source.recipes.map((recipe) => {
  const category = recipe.category || 'Main Course';
  const calories = caloriesByCategory[category] ?? 320;
  const safeTags = Array.from(
    new Set([
      ...(Array.isArray(recipe.tags) ? recipe.tags.map(sentenceCaseTag) : []),
      'Alcohol Free',
      recipe.history_status === 'needs_editorial_verification' ? 'Editorial Review Required' : null,
    ].filter(Boolean)),
  );

  return {
    slug: recipe.slug,
    title: recipe.title,
    cuisine: recipe.cuisine,
    country: cuisineCountries[recipe.cuisine] || recipe.cuisine || 'Global',
    mealType: mealTypeByCategory[category] || 'Dinner',
    foodType: category,
    description: recipe.description,
    history: recipe.history,
    prepTime: `${recipe.prep_minutes ?? 0} min`,
    cookTime: `${recipe.cook_minutes ?? 0} min`,
    totalTime: `${recipe.total_minutes ?? ((recipe.prep_minutes ?? 0) + (recipe.cook_minutes ?? 0))} min`,
    difficulty: recipe.difficulty || 'Easy',
    servings: Number(recipe.servings || 2),
    rating: Number((4.4 + ((Number(recipe.id) % 6) * 0.08)).toFixed(1)),
    calories: `${calories} kcal`,
    tags: safeTags,
    image: featuredImages[recipe.slug] || recipe.image_url || categoryImages[category] || categoryImages['Main Course'],
    featured: Number(recipe.id) <= 8,
    alcoholFree: Boolean(recipe.alcohol_free),
    containsAlcohol: Boolean(recipe.contains_alcohol),
    status: recipe.status || source.publication_status || 'draft',
    sourceType: recipe.source_type || 'original structured starter draft',
    licenseNote: recipe.license_note || source.important_notice || '',
    foodSafetyNote: recipe.food_safety_note || '',
    editorialNote: recipe.editorial_note || '',
    historyStatus: recipe.history_status || '',
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map(formatIngredient) : [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
  };
});

fs.writeFileSync(outputPath, `${JSON.stringify(recipes, null, 2)}\n`, 'utf8');
console.log(`Imported ${recipes.length} recipes to ${outputPath}`);
