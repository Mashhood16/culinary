import fs from 'fs';
import path from 'path';
import exactRecipeCatalog from './recipe-catalog-exact.json';

const rawRecipeCatalog = exactRecipeCatalog as { recipes?: Array<Record<string, unknown>> };

// Automatic mapping engine to group dozens of raw fields into your 5 unified categories
function simplifyMealType(mealType: string, slug: string): string {
  const type = mealType.toLowerCase();
  const id = slug.toLowerCase();

  // 1. Drinks
  if (
    type.includes('drink') || 
    type.includes('chai') || 
    id.includes('chai') || 
    id.includes('tea') || 
    id.includes('coffee') || 
    id.includes('lassi') || 
    id.includes('soda') || 
    id.includes('juice') || 
    id.includes('sharbat')
  ) {
    return 'Drink';
  }
  
  // 2. Desserts (Mapped precisely to "Desert" as requested)
  if (
    type.includes('dessert') || 
    type.includes('sweet') || 
    id.includes('kheer') || 
    id.includes('halwa') || 
    id.includes('kulfi') || 
    id.includes('falooda') || 
    id.includes('jamun') || 
    id.includes('rasgulla') || 
    id.includes('baklava') || 
    id.includes('kunefe') ||
    id.includes('zarda')
  ) {
    return 'Desert';
  }
  
  // 3. Bakery / Breads
  if (
    type.includes('bakery') || 
    type.includes('bread') || 
    type.includes('savouries') || 
    id.includes('roti') || 
    id.includes('naan') || 
    id.includes('kulcha') || 
    id.includes('bakarkhani') || 
    id.includes('sheermal') || 
    id.includes('taftan') || 
    id.includes('paratha') || 
    id.includes('patties') || 
    id.includes('biscuit') || 
    id.includes('rusk')
  ) {
    return 'Bakery';
  }
  
  // 4. Breakfast (Traditional South Indian & Turkish breakfast elements)
  if (
    type.includes('south indian') || 
    id.includes('dosa') || 
    id.includes('idli') || 
    id.includes('vada') || 
    id.includes('upma') || 
    id.includes('pongal') || 
    id.includes('puttu') || 
    id.includes('appam') || 
    id.includes('menemen') || 
    id.includes('sucuklu') || 
    id.includes('bun-kebab')
  ) {
    return 'Breakfast';
  }

  // 5. Default to Mains for all stews, curries, pastas, hot pots, and main courses
  return 'Mains';
}

function formatIngredient(ingredient: { quantity?: string; unit?: string; item?: string } | string) {
  if (typeof ingredient === 'string') return ingredient;
  return [ingredient.quantity, ingredient.unit, ingredient.item].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function normalizeRecipe(recipe: Record<string, unknown>): AdminRecipe {
  const category = String(recipe.category || 'Main Course');
  const prepMinutes = Number(recipe.prep_minutes ?? 0);
  const cookMinutes = Number(recipe.cook_minutes ?? 0);
  const totalMinutes = Number(recipe.total_minutes ?? prepMinutes + cookMinutes);
  
  const slug = String(recipe.slug || recipe.id || '');
  const rawMealType = String((recipe.mealType as string) || (category === 'Drink' ? 'Drink' : category === 'Dessert' ? 'Dessert' : 'Dinner'));

  return {
    slug,
    title: String(recipe.title || recipe.name || ''),
    cuisine: String(recipe.cuisine || ''),
    country: String(recipe.country || recipe.cuisine || 'Global'),
    mealType: simplifyMealType(rawMealType, slug),
    foodType: String(recipe.foodType || category),
    description: String(recipe.description || ''),
    history: String(recipe.history || ''),
    prepTime: String(recipe.prepTime || `${prepMinutes} min`),
    cookTime: String(recipe.cookTime || `${cookMinutes} min`),
    totalTime: String(recipe.totalTime || `${totalMinutes} min`),
    difficulty: String(recipe.difficulty || 'Easy'),
    servings: Number(recipe.servings || 2),
    rating: Number((recipe.rating as number | undefined) ?? Number((4.4 + ((Number(recipe.id) || 0) % 6) * 0.08).toFixed(1))),
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
    featured: Boolean(recipe.featured ?? (Number(recipe.id) || 0) <= 8),
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

const filePath = path.join(process.cwd(), 'recipes-data.json');

// In-Memory Database Cache Variables
let cachedAdminRecipes: AdminRecipe[] | null = null;
let lastReadTime = 0;
const CACHE_TTL = 3000;

export function loadAdminRecipes(): AdminRecipe[] {
  const now = Date.now();
  
  if (process.env.NODE_ENV === 'production' && cachedAdminRecipes && (now - lastReadTime < CACHE_TTL)) {
    return cachedAdminRecipes;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as AdminRecipe[];
    cachedAdminRecipes = data;
    lastReadTime = now;
    return data;
  } catch {
    return [];
  }
}

export function loadPublicRecipes() {
  const allRecipes = loadAllRecipes();
  return allRecipes.filter(recipe => 
    recipe.status !== 'draft' && 
    recipe.status !== 'archived' && 
    recipe.status !== 'deleted'
  );
}

export function loadAllRecipes() {
  const adminRecipes = loadAdminRecipes();
  const merged = new Map<string, AdminRecipe>();

  for (const recipe of (rawRecipeCatalog.recipes ?? []).map(normalizeRecipe)) {
    merged.set(recipe.slug, { ...recipe });
  }

  for (const recipe of adminRecipes) {
    if (recipe.status === 'deleted') {
      merged.delete(recipe.slug);
    } else {
      // Normalization check: Ensure any edited admin entries are also simplified before merging
      const normalizedAdmin = {
        ...recipe,
        mealType: simplifyMealType(recipe.mealType || '', recipe.slug),
      };
      merged.set(recipe.slug, { ...(merged.get(recipe.slug) || {}), ...normalizedAdmin });
    }
  }

  return Array.from(merged.values());
}

export function saveAdminRecipes(items: AdminRecipe[]) {
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  
  cachedAdminRecipes = items;
  lastReadTime = Date.now();
  
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

export function deleteAdminRecipes(slugs: string[]) {
  const adminRecipes = loadAdminRecipes();
  const staticRecipes = (rawRecipeCatalog.recipes ?? []).map(normalizeRecipe);

  let updatedRecipes = adminRecipes.filter(r => {
    const isBeingDeleted = slugs.includes(r.slug);
    const isStatic = staticRecipes.some(sr => sr.slug === r.slug);
    return !isBeingDeleted || isStatic;
  });

  for (const slug of slugs) {
    const isStatic = staticRecipes.some(sr => sr.slug === slug);
    if (isStatic) {
      const index = updatedRecipes.findIndex(r => r.slug === slug);
      if (index !== -1) {
        updatedRecipes[index] = { ...updatedRecipes[index], status: 'deleted' };
      } else {
        const baseRecipe = staticRecipes.find(sr => sr.slug === slug);
        if (baseRecipe) {
          updatedRecipes.push({
            ...baseRecipe,
            status: 'deleted',
          });
        }
      }
    }
  }

  saveAdminRecipes(updatedRecipes);
  return updatedRecipes;
}

export function deleteAllRecipes() {
  const staticRecipes = (rawRecipeCatalog.recipes ?? []).map(normalizeRecipe);
  
  const tombstones: AdminRecipe[] = staticRecipes.map(sr => ({
    ...sr,
    status: 'deleted',
  }));

  saveAdminRecipes(tombstones);
  return tombstones;
}