import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { loadAdminRecipes, loadAllRecipes, saveAdminRecipes } from '@/lib/recipe-store';

function buildResponse(status: number, payload: Record<string, unknown>) {
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  if (!verifyAdminSession(token)) return buildResponse(401, { error: 'Unauthorized' });

  const body = await request.json();
  const slugs = Array.isArray(body.slugs) ? body.slugs.filter(Boolean) : [];

  const recipes = loadAdminRecipes();

  if (body.action === 'publish-all') {
    const mergedRecipes = loadAllRecipes();
    const unpublishedRecipes = mergedRecipes.filter((recipe) => String(recipe.status || '').toLowerCase() !== 'published');
    const next = mergedRecipes.map((recipe) =>
      unpublishedRecipes.some((item) => item.slug === recipe.slug) ? { ...recipe, status: 'published' } : recipe,
    );
    saveAdminRecipes(next);
    return buildResponse(200, { message: `Published ${unpublishedRecipes.length} unpublished recipe(s).`, total: next.length });
  }

  if (!slugs.length) return buildResponse(400, { error: 'Select at least one recipe.' });

  if (body.action === 'delete-selected') {
    const next = recipes.filter((recipe) => !slugs.includes(recipe.slug));
    saveAdminRecipes(next);
    return buildResponse(200, { message: `Deleted ${slugs.length} recipe(s).`, total: next.length });
  }

  if (body.action === 'bulk-edit') {
    const updates = body.updates || {};
    const next = recipes.map((recipe) => (slugs.includes(recipe.slug) ? { ...recipe, ...updates } : recipe));
    saveAdminRecipes(next);
    return buildResponse(200, { message: `Updated ${slugs.length} recipe(s).`, total: next.length });
  }

  return buildResponse(400, { error: 'Unsupported action.' });
}
