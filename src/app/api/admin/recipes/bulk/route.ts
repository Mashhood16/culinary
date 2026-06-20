import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { addAdminRecipe, loadAdminRecipes, saveAdminRecipes } from '@/lib/recipe-store';

function generateSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeRow(row: Record<string, unknown>) {
  const title = String(row.title || row.Title || '').trim();
  if (!title) return null;

  const ingredients = String(row.ingredients || row.Ingredients || '')
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);

  const steps = String(row.steps || row.Method || row.Steps || '')
    .split(/\n\s*\n|\n/)
    .map((step) => step.trim())
    .filter(Boolean);

  const tags = String(row.tags || row.Tags || '')
    .split(/,|;/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    slug: String(row.slug || row.Slug || generateSlug(title)),
    title,
    cuisine: String(row.cuisine || row.Cuisine || 'General'),
    country: String(row.country || row.Country || 'Global'),
    mealType: String(row.mealType || row['Meal Type'] || 'Dinner'),
    foodType: String(row.foodType || row['Food Type'] || 'Recipe'),
    description: String(row.description || row.Description || ''),
    history: String(row.history || row.History || ''),
    prepTime: String(row.prepTime || row['Prep Time'] || '10 min'),
    cookTime: String(row.cookTime || row['Cook Time'] || '10 min'),
    totalTime: String(row.totalTime || row['Total Time'] || ''),
    difficulty: String(row.difficulty || row.Difficulty || 'Easy'),
    servings: Number(row.servings || row.Servings || 2),
    rating: Number(row.rating || row.Rating || 5),
    calories: String(row.calories || row.Calories || '300 kcal'),
    image: String(row.image || row.Image || ''),
    tags,
    ingredients,
    steps,
    alcoholFree: String(row.alcoholFree || row['Alcohol Free'] || '').toLowerCase() === 'true',
    containsAlcohol: String(row.containsAlcohol || row['Contains Alcohol'] || '').toLowerCase() === 'true',
    status: String(row.status || row.Status || 'draft'),
    sourceType: String(row.sourceType || row['Source Type'] || ''),
    licenseNote: String(row.licenseNote || row['License Note'] || ''),
    foodSafetyNote: String(row.foodSafetyNote || row['Food Safety Note'] || ''),
    editorialNote: String(row.editorialNote || row['Editorial Note'] || ''),
    historyStatus: String(row.historyStatus || row['History Status'] || ''),
    featured: String(row.featured || row.Featured || '').toLowerCase() === 'true',
  };
}

export async function POST(request: Request) {
  // Auth check: middleware already gates /api/admin/ routes, verify cookie exists
  const hasCookie = /admin_session=[^;]+/.test(request.headers.get('cookie') || '');
  if (!hasCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await (file as File).arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

    const imported = rows
      .map((row: any) => normalizeRow(row))
      .filter(Boolean) as any[];

    const existing = await loadAdminRecipes();
    const merged = [...imported, ...existing];
    await saveAdminRecipes(merged);

    return NextResponse.json({ ok: true, imported: imported.length, total: merged.length });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to import recipes from Excel file.', details: String(error) }, { status: 400 });
  }
}
