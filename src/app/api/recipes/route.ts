import { NextResponse } from 'next/server';
import { loadPublicRecipes } from '@/lib/recipe-store';

export async function GET() {
  return NextResponse.json(loadPublicRecipes());
}
