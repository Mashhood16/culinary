import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { addAdminRecipe, loadAllRecipes, updateAdminRecipe } from '@/lib/recipe-store';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  if (!verifyAdminSession(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(loadAllRecipes());
}

function normalizeRecipe(body: any) {
  const tags = Array.isArray(body.tags)
    ? body.tags
    : String(body.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

  const ingredients = Array.isArray(body.ingredients)
    ? body.ingredients
    : String(body.ingredients || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

  const steps = Array.isArray(body.steps)
    ? body.steps
    : String(body.steps || '')
        .split('\n')
        .map((step) => step.trim())
        .filter(Boolean);

  return {
    slug: String(body.slug || body.title.toLowerCase().replace(/\s+/g, '-')),
    title: String(body.title || ''),
    cuisine: String(body.cuisine || 'General'),
    country: String(body.country || 'Global'),
    mealType: String(body.mealType || 'Dinner'),
    foodType: String(body.foodType || 'Recipe'),
    description: String(body.description || ''),
    history: String(body.history || ''),
    prepTime: String(body.prepTime || '10 min'),
    cookTime: String(body.cookTime || '10 min'),
    totalTime: String(body.totalTime || ''),
    difficulty: String(body.difficulty || 'Easy'),
    servings: Number(body.servings || 2),
    rating: Number(body.rating || 5),
    calories: String(body.calories || '300 kcal'),
    tags,
    ingredients,
    steps,
    image: String(body.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80'),
    alcoholFree: Boolean(body.alcoholFree),
    containsAlcohol: Boolean(body.containsAlcohol),
    status: String(body.status || ''),
    sourceType: String(body.sourceType || ''),
    licenseNote: String(body.licenseNote || ''),
    foodSafetyNote: String(body.foodSafetyNote || ''),
    editorialNote: String(body.editorialNote || ''),
    historyStatus: String(body.historyStatus || ''),
    featured: Boolean(body.featured),
  };
}

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  if (!verifyAdminSession(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  return NextResponse.json(addAdminRecipe(normalizeRecipe(body)));
}

export async function PUT(request: Request) {
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  if (!verifyAdminSession(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.slug) return NextResponse.json({ error: 'Recipe slug is required.' }, { status: 400 });

  return NextResponse.json(updateAdminRecipe(String(body.slug), normalizeRecipe(body)));
}
