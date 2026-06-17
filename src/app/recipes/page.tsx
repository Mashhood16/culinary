import { Suspense } from 'react';
import Link from 'next/link';
import { loadPublicRecipes } from '@/lib/recipe-store';
import ImageWithSkeleton from '@/components/ImageWithSkeleton';
import RecipeFilters from '@/components/RecipeFilters';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ cuisine?: string; mealType?: string; q?: string }> | { cuisine?: string; mealType?: string; q?: string };
}

export default async function RecipesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const cuisine = resolvedSearchParams.cuisine;
  const mealType = resolvedSearchParams.mealType;
  const q = resolvedSearchParams.q;

  const allRecipes = await loadPublicRecipes();

  const uniqueCuisines = Array.from(new Set(allRecipes.map(r => r.cuisine).filter(Boolean))).sort();
  const uniqueMealTypes = Array.from(new Set(allRecipes.map(r => r.mealType).filter(Boolean))).sort();

  let filteredRecipes = [...allRecipes];

  if (cuisine && cuisine !== 'All') {
    filteredRecipes = filteredRecipes.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase());
  }
  if (mealType && mealType !== 'All') {
    filteredRecipes = filteredRecipes.filter(r => r.mealType.toLowerCase() === mealType.toLowerCase());
  }
  if (q) {
    const query = q.toLowerCase();
    filteredRecipes = filteredRecipes.filter(r => 
      r.title.toLowerCase().includes(query) || 
      r.cuisine.toLowerCase().includes(query) || 
      r.description.toLowerCase().includes(query) || 
      (r.tags ?? []).some(t => t.toLowerCase().includes(query))
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 font-sans page-transition">
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

          {/* Render the full-width dynamic search & select filter bar */}
          {/* Removed max-w-4xl from fallback skeleton so it perfectly matches the expanded inputs */}
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
                href={`/recipes/${recipe.slug}`}                className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-stone-200 bg-white p-5 shadow-[0_15px_40px_rgba(28,25,23,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(28,25,23,0.08)] dark:border-stone-850 dark:bg-stone-900/95"
              >
                <div>
                  <div className="relative overflow-hidden rounded-2xl h-40 w-full">
                    {recipe.image ? (
                      <ImageWithSkeleton 
                        src={recipe.image} 
                        alt={recipe.title} 
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                      />
                    ) : null}
                    
                    <span className="absolute left-3 top-3 rounded-full bg-amber-100/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-950 shadow-sm border border-amber-200/40">
                      {recipe.cuisine}
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