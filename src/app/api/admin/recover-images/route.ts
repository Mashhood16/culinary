import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { loadAdminRecipes, saveAdminRecipes } from '@/lib/recipe-store';

export const dynamic = 'force-dynamic';

/** Normalize a filename into a kebab-case slug for matching. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Check admin session from cookie. The middleware already gates /api/admin/ routes,
 *  so we just need to verify the cookie exists (same pattern as other admin endpoints). */
function requireAdmin(request: Request): boolean {
  const cookie = request.headers.get('cookie') || '';
  return /admin_session=[^;]+/.test(cookie);
}

/** Build a map: normalized-slug → latest blob URL for all blobs under recipes/. */
async function buildBlobMap() {
  const { blobs } = await list({ prefix: 'recipes/' });
  const map = new Map<string, { url: string; pathname: string }>();
  for (const blob of blobs) {
    const filename = blob.pathname.replace('recipes/', '');
    // Remove timestamp prefix: "1712345678901-beef-biryani.jpg" → "beef-biryani"
    const raw = filename.replace(/^\d+-/, '').replace(/\.[^.]+$/, '');
    const slug = slugify(raw);
    if (slug) {
      map.set(slug, { url: blob.url, pathname: blob.pathname });
    }
  }
  return { blobs, map };
}

/** Also build a slug→slug map from recipe titles so "Beef Biryani.jpg" matches "beef-biryani". */
function buildTitleSlugSet(recipes: { slug: string; title: string }[]) {
  const set = new Map<string, string>();
  for (const r of recipes) {
    set.set(slugify(r.title), r.slug);
    set.set(r.slug, r.slug);
  }
  return set;
}

// GET /api/admin/recover-images — preview: list all blobs and match to recipes
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { blobs, map: blobMap } = await buildBlobMap();
    const recipes = await loadAdminRecipes();
    const titleSlugSet = buildTitleSlugSet(recipes);

    let matched = 0;
    let alreadyGood = 0;
    const matchedDetails: { slug: string; blobFile: string }[] = [];
    const unmatchedBlobs: string[] = [];

    Array.from(blobMap.entries()).forEach(([blobSlug, blob]) => {
      // Try direct slug match first, then title-based match
      const recipeSlug = titleSlugSet.get(blobSlug) || blobSlug;
      const recipe = recipes.find(r => r.slug === recipeSlug);
      if (recipe) {
        const currentImg = recipe.image as any;
        const hasRealImage = typeof currentImg === 'string' && currentImg.includes('blob.vercel-storage.com');
        if (hasRealImage) {
          alreadyGood++;
        } else {
          matched++;
          matchedDetails.push({ slug: recipe.slug, blobFile: blob.pathname });
        }
      } else {
        unmatchedBlobs.push(blob.pathname);
      }
    });

    return NextResponse.json({
      totalBlobs: blobs.length,
      matched,
      alreadyGood,
      unmatchedBlobs: unmatchedBlobs.slice(0, 30),
      matchedDetails: matchedDetails.slice(0, 30),
      totalRecipes: recipes.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/recover-images — apply the recovery
export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { map: blobMap } = await buildBlobMap();
    const recipes = await loadAdminRecipes();
    const titleSlugSet = buildTitleSlugSet(recipes);
    let recovered = 0;

    const updated = recipes.map((r) => {
      const currentImg = r.image as any;
      const hasRealImage = typeof currentImg === 'string' && currentImg.includes('blob.vercel-storage.com');
      if (hasRealImage) return r;

      // Try matching by slug, then by title
      const bySlug = blobMap.get(r.slug);
      const byTitle = blobMap.get(slugify(r.title));
      const blob = bySlug || byTitle;
      if (blob) {
        recovered++;
        return { ...r, image: blob.url };
      }
      return r;
    });

    if (recovered > 0) {
      await saveAdminRecipes(updated);
    }

    return NextResponse.json({
      message: recovered > 0
        ? `Successfully recovered ${recovered} recipe images from Vercel Blob storage!`
        : 'No recoverable images found. You may need to re-upload images manually via the admin panel.',
      recovered,
      totalBlobFiles: blobMap.size,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
