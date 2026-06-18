import exactRecipeCatalog from './recipe-catalog-exact.json';

const rawRecipeCatalog = exactRecipeCatalog as { recipes?: Array<Record<string, unknown>> };

function formatIngredient(ingredient: { quantity?: string; unit?: string; item?: string } | string) {
  if (typeof ingredient === 'string') return ingredient;
  return [ingredient.quantity, ingredient.unit, ingredient.item].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function normalizeRecipe(recipe: Record<string, unknown>): Recipe {
  const category = String(recipe.category || 'Main Course');
  const prepMinutes = Number(recipe.prep_minutes ?? 0);
  const cookMinutes = Number(recipe.cook_minutes ?? 0);
  const totalMinutes = Number(recipe.total_minutes ?? prepMinutes + cookMinutes);
  const id = Number(recipe.id ?? 0);

  return {
    slug: String(recipe.slug || ''),
    title: String(recipe.title || ''),
    cuisine: String(recipe.cuisine || ''),
    country: String(recipe.country || recipe.cuisine || 'Global'),
    mealType: String((recipe.mealType as string) || (category === 'Drink' ? 'Drink' : category === 'Dessert' ? 'Dessert' : 'Dinner')),
    foodType: String(recipe.foodType || category),
    description: String(recipe.description || ''),
    history: String(recipe.history || ''),
    prepTime: String(recipe.prepTime || `${prepMinutes} min`),
    cookTime: String(recipe.cookTime || `${cookMinutes} min`),
    totalTime: String(recipe.totalTime || `${totalMinutes} min`),
    difficulty: String(recipe.difficulty || 'Easy'),
    servings: Number(recipe.servings || 2),
    rating: Number((recipe.rating as number | undefined) ?? Number((4.4 + ((id % 6) * 0.08)).toFixed(1))),
    calories: String(recipe.calories || '320 kcal'),
    tags: Array.isArray(recipe.tags) ? recipe.tags.map((tag) => String(tag)) : [],
    image: String(recipe.image || (recipe.image_url as string) || ''),
    featured: Boolean(recipe.featured ?? id <= 8),
    alcoholFree: Boolean((recipe.alcoholFree as boolean | undefined) ?? (recipe.contains_alcohol as boolean | undefined) === false),
    containsAlcohol: Boolean(recipe.containsAlcohol ?? recipe.contains_alcohol ?? false),
    status: String(recipe.status || ''),
    sourceType: String(recipe.source_type || ''),
    licenseNote: String(recipe.license_note || ''),
    foodSafetyNote: String(recipe.food_safety_note || ''),
    editorialNote: String(recipe.editorial_note || ''),
    historyStatus: String(recipe.history_status || ''),
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ingredient) => formatIngredient(ingredient as any)) : [],
    steps: Array.isArray(recipe.steps) ? recipe.steps.map((step) => String(step)) : [],
  };
}

export type Recipe = {
  slug: string;
  title: string;
  cuisine: string;
  country: string;
  mealType: string;
  foodType: string;
  description: string;
  history: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  rating: number;
  calories: string;
  tags: string[];
  image: string;
  featured?: boolean;
  totalTime?: string;
  alcoholFree?: boolean;
  containsAlcohol?: boolean;
  status?: string;
  sourceType?: string;
  licenseNote?: string;
  foodSafetyNote?: string;
  editorialNote?: string;
  historyStatus?: string;
  ingredients?: string[];
  steps?: string[];
};

export const recipes: Recipe[] = (rawRecipeCatalog.recipes ?? []).map(normalizeRecipe);

export const cuisines = Array.from(new Set(recipes.map((recipe) => recipe.cuisine))).sort();
export const recipeTags = Array.from(new Set(recipes.flatMap((recipe) => recipe.tags))).sort();
export const mealTypes = Array.from(new Set(recipes.map((recipe) => recipe.mealType))).sort();
export const difficulties = Array.from(new Set(recipes.map((recipe) => recipe.difficulty))).sort();
