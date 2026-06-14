import fs from 'fs';
import path from 'path';
import recipeCatalog from './recipe-catalog.json';

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

export function loadAllRecipes() {
  const adminRecipes = loadAdminRecipes();
  const merged = new Map<string, AdminRecipe>();

  for (const recipe of recipeCatalog as AdminRecipe[]) {
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
  const baseRecipe = (recipeCatalog as AdminRecipe[]).find((recipe) => recipe.slug === slug);

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
