import { NextResponse } from 'next/server';
import { loadAllRecipes, deleteAllRecipes, addAdminRecipe, updateAdminRecipe } from '@/lib/recipe-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const recipes = loadAllRecipes();
  return NextResponse.json(recipes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    addAdminRecipe(body);
    return NextResponse.json(loadAllRecipes());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { slug } = body;
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }
    updateAdminRecipe(slug, body);
    return NextResponse.json(loadAllRecipes());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    deleteAllRecipes();
    return NextResponse.json({ message: 'All recipes deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}