import { NextResponse } from 'next/server';
import { loadPublicRecipes } from '@/lib/recipe-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const recipes = loadPublicRecipes();
    return NextResponse.json(recipes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}