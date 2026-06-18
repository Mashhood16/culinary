import { NextResponse } from 'next/server';
import { loadPublicRecipes } from '@/lib/recipe-store';

export async function GET() {
<<<<<<< HEAD
  const recipes = await loadPublicRecipes();
  return NextResponse.json(recipes);
=======
  return NextResponse.json(loadPublicRecipes());
>>>>>>> origin/main
}
