import { NextResponse } from 'next/server';
import { deleteAdminRecipes, loadAllRecipes, saveAdminRecipes, loadAdminRecipes, cleanupStaleImages } from '@/lib/recipe-store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, slugs, updates } = body;

    if (action === 'delete-selected') {
      if (!Array.isArray(slugs)) {
        return NextResponse.json({ error: 'Invalid slugs' }, { status: 400 });
      }
      // Added await to the async database deletion helper
      await deleteAdminRecipes(slugs);
      return NextResponse.json({ message: 'Selected recipes deleted successfully' });
    }

    if (action === 'publish-all') {
      // Added await to retrieve resolved arrays from your async database helpers
      const allRecipes = await loadAllRecipes();
      const adminRecipes = await loadAdminRecipes();
      const updatedAdminRecipes = [...adminRecipes];

      for (const recipe of allRecipes) {
        const existingIndex = updatedAdminRecipes.findIndex(r => r.slug === recipe.slug);
        if (existingIndex !== -1) {
          updatedAdminRecipes[existingIndex].status = 'published';
        } else {
          updatedAdminRecipes.push({ ...recipe, status: 'published' });
        }
      }
      // Added await to save operations
      await saveAdminRecipes(updatedAdminRecipes);
      return NextResponse.json({ message: 'All visible recipes published successfully' });
    }

    if (action === 'bulk-edit') {
      if (!Array.isArray(slugs)) {
        return NextResponse.json({ error: 'Invalid slugs' }, { status: 400 });
      }
      // Added await to retrieve resolved arrays from your async database helpers
      const allRecipes = await loadAllRecipes();
      const adminRecipes = await loadAdminRecipes();
      const updatedAdminRecipes = [...adminRecipes];

      for (const slug of slugs) {
        const targetRecipe = allRecipes.find(r => r.slug === slug);
        if (!targetRecipe) continue;

        const mergedUpdate = { ...targetRecipe, ...updates };
        const existingIndex = updatedAdminRecipes.findIndex(r => r.slug === slug);
        if (existingIndex !== -1) {
          updatedAdminRecipes[existingIndex] = { ...updatedAdminRecipes[existingIndex], ...updates };
        } else {
          updatedAdminRecipes.push(mergedUpdate);
        }
      }
      // Added await to save operations
      await saveAdminRecipes(updatedAdminRecipes);
      return NextResponse.json({ message: 'Bulk edit applied successfully' });
    }

    if (action === 'cleanup-images') {
      const result = await cleanupStaleImages();
      return NextResponse.json({ message: `Cleaned ${result.cleaned} recipes. ${result.saved ? 'Saved to KV.' : 'No changes needed.'}` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}