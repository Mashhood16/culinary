import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv'; // Official Vercel KV package
import exactRecipeCatalog from './recipe-catalog-exact.json';

const rawRecipeCatalog = exactRecipeCatalog as { recipes?: Array<Record<string, unknown>> };

function formatIngredient(ingredient: { quantity?: string; unit?: string; item?: string } | string) {
  if (typeof ingredient === 'string') return ingredient;
  return [ingredient.quantity, ingredient.unit, ingredient.item].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function simplifyMealType(mealType: string | undefined, slug: string | undefined): string {
  // 1. Safety Guard: If inputs are missing, default to 'Mains'
  const type = (mealType || '').toLowerCase();
  const id = (slug || '').toLowerCase();

  // 2. Drinks
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
  
  // 3. Desserts
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
  
  // 4. Bakery / Breads
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
  
  // 5. Breakfast
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

  return 'Mains';
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
<<<<<<< HEAD
    status: String(recipe.status || '').trim().toLowerCase(),
=======
    status: String(recipe.status || ''),
>>>>>>> origin/main
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
<<<<<<< HEAD
  image: string;
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
  image: string | { publicId: string; alt: string; status?: string }; 
>>>>>>> origin/main
};

const filePath = path.join(process.cwd(), 'recipes-data.json');
const isVercelKVActive = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export async function loadAdminRecipes(): Promise<AdminRecipe[]> {
  if (isVercelKVActive) {
    try {
      // FIX: Removed in-memory cached variables entirely. All serverless containers 
      // now query the cloud database in real-time, enforcing perfect synchronization.
      const data = await kv.get<AdminRecipe[]>('recipes_data');
      
      // Auto-Seeder
      if (!data || data.length === 0) {
        console.log('Upstash database is empty. Auto-seeding from recipes-data.json...');
        try {
          if (fs.existsSync(filePath)) {
            const localData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as AdminRecipe[];
            if (localData && localData.length > 0) {
              await kv.set('recipes_data', localData);
              return localData;
            }
          }
        } catch (err: any) {
          console.error('Failed to auto-seed Upstash:', err.message);
        }
      }
      
      return data || [];
    } catch (e) {
      console.error('Vercel KV database read error:', e);
      return [];
    }
  }

  // Local fallback
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as AdminRecipe[];
  } catch {
    return [];
  }
}

export async function loadPublicRecipes() {
  const allRecipes = await loadAllRecipes();
<<<<<<< HEAD
  return allRecipes.filter(recipe => {
    const status = (recipe.status || '').trim().toLowerCase();
    return status === 'published' || status === 'featured';
  });
=======
  return allRecipes.filter(recipe => 
    recipe.status !== 'draft' && 
    recipe.status !== 'archived' && 
    recipe.status !== 'deleted'
  );
>>>>>>> origin/main
}

export async function loadAllRecipes() {
  const adminRecipes = await loadAdminRecipes();
<<<<<<< HEAD

  // If the admin store already contains records, treat that as the source of truth.
  // This prevents stale static placeholder catalog entries from being mixed into the
  // public/admin views after recipes have been removed or replaced.
  if (adminRecipes.length > 0) {
    return adminRecipes.map((recipe) => ({
      ...recipe,
      status: (recipe.status || '').trim().toLowerCase() || 'draft',
      mealType: simplifyMealType(recipe.mealType || '', recipe.slug),
    }));
  }

=======
>>>>>>> origin/main
  const merged = new Map<string, AdminRecipe>();

  for (const recipe of (rawRecipeCatalog.recipes ?? []).map(normalizeRecipe)) {
    merged.set(recipe.slug, { ...recipe });
  }

  for (const recipe of adminRecipes) {
    if (recipe.status === 'deleted') {
      merged.delete(recipe.slug);
    } else {
      const normalizedAdmin = {
        ...recipe,
        mealType: simplifyMealType(recipe.mealType || '', recipe.slug),
      };
      merged.set(recipe.slug, { ...(merged.get(recipe.slug) || {}), ...normalizedAdmin });
    }
  }

  return Array.from(merged.values());
}

export async function saveAdminRecipes(items: AdminRecipe[]) {
  if (isVercelKVActive) {
    try {
      await kv.set('recipes_data', items);
      return items;
    } catch (e) {
      console.error('Vercel KV database write error:', e);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  return items;
}

export async function addAdminRecipe(item: AdminRecipe) {
  const recipes = await loadAdminRecipes();
  const next = [item, ...recipes];
  await saveAdminRecipes(next);
  return next;
}

export async function updateAdminRecipe(slug: string, item: AdminRecipe) {
  const recipes = await loadAdminRecipes();
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

  await saveAdminRecipes(next);
  return next;
}

export async function deleteAdminRecipes(slugs: string[]) {
  const adminRecipes = await loadAdminRecipes();
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

  await saveAdminRecipes(updatedRecipes);
  return updatedRecipes;
}

export async function deleteAllRecipes() {
  const staticRecipes = (rawRecipeCatalog.recipes ?? []).map(normalizeRecipe);
  
  const tombstones: AdminRecipe[] = staticRecipes.map(sr => ({
    ...sr,
    status: 'deleted',
  }));

  await saveAdminRecipes(tombstones);
  return tombstones;
}