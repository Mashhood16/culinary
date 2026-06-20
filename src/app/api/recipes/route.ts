import { NextResponse } from 'next/server';
import { loadPublicRecipes } from '@/lib/recipe-store';

export async function GET() {
  const recipes = await loadPublicRecipes();
  return NextResponse.json(recipes);
}
