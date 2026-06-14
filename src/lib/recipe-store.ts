import fs from 'fs';
import path from 'path';
import exactRecipeCatalog from './recipe-catalog-exact.json';

const rawRecipeCatalog = exactRecipeCatalog as { recipes?: Array<Record<string, unknown>> };

function formatIngredient(ingredient: { quantity?: string; unit?: string; item?: string } | string) {
  if (typeof ingredient === 'string') return ingredient;
  return [ingredient.quantity, ingredient.unit, ingredient.item].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function normalizeRecipe(recipe: Record<string, unknown>): AdminRecipe {
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
    featured: Boolean(recipe.featured ?? id <= 8),
  };
}

export type AdminRecipe = {
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
  featured?: boolean;
};

const filePath = path.join(process.cwd(), 'src/lib/recipes-data.json');

export function loadAdminRecipes(): AdminRecipe[] {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as AdminRecipe[];
  } catch {
    return [];
  }
}

export function loadPublicRecipes() {
  return (rawRecipeCatalog.recipes ?? []).map(normalizeRecipe);
}

export function loadAllRecipes() {
  const adminRecipes = loadAdminRecipes();
  const merged = new Map<string, AdminRecipe>();

  for (const recipe of (rawRecipeCatalog.recipes ?? []).map(normalizeRecipe)) {
    merged.set(recipe.slug, { ...recipe });
  }

  for (const recipe of adminRecipes) {
    merged.set(recipe.slug, { ...(merged.get(recipe.slug) || {}), ...recipe });
  }

  return Array.from(merged.values());
}

export function saveAdminRecipes(items: AdminRecipe[]) {
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  return items;
}

export function addAdminRecipe(item: AdminRecipe) {
  const recipes = loadAdminRecipes();
  const next = [item, ...recipes];
  saveAdminRecipes(next);
  return next;
}

export function updateAdminRecipe(slug: string, item: AdminRecipe) {
  const recipes = loadAdminRecipes();
  const existingRecipe = recipes.find((recipe) => recipe.slug === slug);
  const baseRecipe = (rawRecipeCatalog.recipes ?? []).map(normalizeRecipe).find((recipe) => recipe.slug === slug);

  const next = existingRecipe
    ? recipes.map((recipe) => (recipe.slug === slug ? { ...recipe, ...item, slug } : recipe))
    : [
        {
          ...(baseRecipe || {}),
          ...item,
          slug,
        },
        ...recipes,
      ];

  saveAdminRecipes(next);
  return next;
}
