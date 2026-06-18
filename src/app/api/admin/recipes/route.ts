import { NextResponse } from 'next/server';
import { loadAllRecipes, deleteAllRecipes, addAdminRecipe, updateAdminRecipe } from '@/lib/recipe-store';

export const dynamic = 'force-dynamic';

// GET /api/admin/recipes
export async function GET() {
  try {
    // Added await to safely resolve the async database array before serializing to JSON
    const recipes = await loadAllRecipes();
    return NextResponse.json(recipes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/recipes (Add Recipe)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await addAdminRecipe(body);
    return NextResponse.json(await loadAllRecipes());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/recipes (Update Recipe)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { slug } = body;
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }
    await updateAdminRecipe(slug, body);
    return NextResponse.json(await loadAllRecipes());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/recipes (Delete All Recipes)
export async function DELETE() {
  try {
    await deleteAllRecipes();
    return NextResponse.json({ message: 'All recipes deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}