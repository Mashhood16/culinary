import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { loadPublicRecipes } from '@/lib/recipe-store';
import { getImageUrl } from '@/lib/recipe-image';
import CuisineWithFlag from '@/components/CuisineWithFlag';
import RecipeFilters from '@/components/RecipeFilters';
import ScrollToTopOnMount from '@/components/ScrollToTopOnMount';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Page cached for 60 seconds

interface PageProps {
  searchParams: Promise<{ cuisine?: string; mealType?: string; difficulty?: string; q?: string }> | { cuisine?: string; mealType?: string; difficulty?: string; q?: string };
}

export default async function RecipesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const cuisine = resolvedSearchParams.cuisine;
  const mealType = resolvedSearchParams.mealType;
  const difficulty = resolvedSearchParams.difficulty;
  const q = resolvedSearchParams.q;

  const allRecipes = await loadPublicRecipes();

  const uniqueCuisines = Array.from(new Set(allRecipes.map(r => r.cuisine).filter(Boolean))).sort();
  const uniqueMealTypes = Array.from(new Set(allRecipes.map(r => r.mealType).filter(Boolean))).sort();

  let filteredRecipes = [...allRecipes];

  if (cuisine && cuisine !== 'All') {
    filteredRecipes = filteredRecipes.filter(r => r.cuisine?.toLowerCase() === cuisine.toLowerCase());
  }
  if (mealType && mealType !== 'All') {
    filteredRecipes = filteredRecipes.filter(r => r.mealType?.toLowerCase() === mealType.toLowerCase());
  }
  if (difficulty && difficulty !== 'All') {
    filteredRecipes = filteredRecipes.filter(r => r.difficulty?.toLowerCase() === difficulty.toLowerCase());
  }
  if (q) {
    const query = q.toLowerCase();
    filteredRecipes = filteredRecipes.filter(r => 
      r.title.toLowerCase().includes(query) || 
      r.cuisine?.toLowerCase().includes(query) || 
      r.description.toLowerCase().includes(query) || 
      (r.tags ?? []).some(t => t.toLowerCase().includes(query))
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 font-sans page-transition">
      <ScrollToTopOnMount />
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 space-y-8 animate-fade-in">
        
        {/* Page Header */}
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-700 dark:text-amber-500 font-semibold">Our Catalog</p>
            <h1 className="mt-3 text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 lg:text-5xl">Explore dynamic recipes</h1>
            <p className="mt-4 max-w-2xl text-stone-600 dark:text-stone-300 leading-relaxed">
              Discover a curated collection of global recipes with complete ingredients, scalable serving controls, and direct step summaries.
            </p>
          </div>

          <Suspense fallback={<div className="h-12 bg-stone-100/50 dark:bg-stone-900/50 rounded-2xl animate-pulse w-full" />}>
            <RecipeFilters cuisines={uniqueCuisines} mealTypes={uniqueMealTypes} />
          </Suspense>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredRecipes.map((recipe) => (
              <Link 
                key={recipe.slug} 
                href={`/recipes/${recipe.slug}`} 
                className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-stone-200 bg-white p-5 shadow-[0_15px_40px_rgba(28,25,23,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(28,25,23,0.08)] dark:border-stone-850 dark:bg-stone-900/95"
              >
                <div>
                  <div className="relative overflow-hidden rounded-2xl h-40 w-full bg-stone-100 dark:bg-stone-800">
                    {recipe.image ? (
                      <Image 
                        src={getImageUrl(recipe.image, { width: 640, height: 400 })}
                        alt={typeof recipe.image === 'object' && recipe.image !== null && 'alt' in recipe.image ? recipe.image.alt || recipe.title : recipe.title}
                        width={640}
                        height={400}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 320px"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-400 text-xs">No Image</div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-amber-100/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-950 shadow-sm border border-amber-200/40">
                      <CuisineWithFlag cuisine={recipe.cuisine} />
                    </span>
                  </div>
                  
                  <h3 className="mt-4 text-xl font-bold font-serif text-stone-900 group-hover:text-amber-700 transition-colors dark:text-stone-100 dark:group-hover:text-amber-500 line-clamp-1">
                    {recipe.title}
                  </h3>
                  
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                <div className="mt-4 border-t border-stone-100 pt-3 flex items-center justify-between text-xs text-stone-500 dark:border-stone-800">
                  <span>{recipe.difficulty}</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-500 group-hover:underline flex items-center gap-1">
                    View recipe 
                    <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-12 text-center text-stone-600 dark:text-stone-400">
            No recipes found matching your filters.
          </div>
        )}
      </div>
    </main>
  );
}