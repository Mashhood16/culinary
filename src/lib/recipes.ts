import recipeCatalog from './recipe-catalog.json';

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

export const recipes: Recipe[] = recipeCatalog as Recipe[];

export const cuisines = Array.from(new Set(recipes.map((recipe) => recipe.cuisine))).sort();
export const recipeTags = Array.from(new Set(recipes.flatMap((recipe) => recipe.tags))).sort();
export const mealTypes = Array.from(new Set(recipes.map((recipe) => recipe.mealType))).sort();
export const difficulties = Array.from(new Set(recipes.map((recipe) => recipe.difficulty))).sort();
