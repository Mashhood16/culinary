'use client'; // This is a Client Component to handle dynamic fetch

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { summarizeMethodStep } from '@/lib/method-summary';
import { getImageUrl } from '@/lib/recipe-image';
import ServingScaler from './ServingScaler';
import QuickEditButton from '@/components/QuickEditButton';
import IngredientChecklist from '@/components/IngredientChecklist';
import FavoriteButton from '@/components/FavoriteButton';
import ImageWithSkeleton from '@/components/ImageWithSkeleton';
import type { AdminRecipe } from '@/lib/recipe-store';

export const dynamic = 'force-dynamic';

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const [recipe, setRecipe] = useState<AdminRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        // Fetch data through your pre-existing backend API route
        const res = await fetch('/api/recipes');
        if (!res.ok) throw new Error('Failed to fetch recipes from server');
        
        const publicRecipes: AdminRecipe[] = await res.json();
        const found = publicRecipes.find((item) => item.slug === params.slug);
        
        if (isMounted) {
          setRecipe(found || null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading recipe data:", err);
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [params.slug]);

  if (loading) {
    return <main className="min-h-screen bg-stone-50 p-10 text-center font-sans dark:bg-stone-900">Loading...</main>;
  }

  if (!recipe) notFound();

  const ingredientList = recipe.ingredients?.length
    ? recipe.ingredients
    : [`${recipe.foodType || 'Signature'} base ingredient`, 'Fresh aromatics or herbs'];

  const methodSteps = (recipe.steps && recipe.steps.length > 0) 
    ? recipe.steps.map((step) => summarizeMethodStep(step)) 
    : ["Follow the instructions on the recipe card."];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 font-sans page-transition">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:px-10">
        
        <article id="print-area" className="space-y-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95 animate-fade-in">
          <div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-amber-700 dark:text-amber-500 font-semibold">{recipe.cuisine}</p>
                <h1 className="mt-3 text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">{recipe.title}</h1>
              </div>
              
              <div className="flex flex-col items-end gap-3 shrink-0">
                <FavoriteButton 
                  slug={recipe.slug} 
                  title={recipe.title} 
                  cuisine={recipe.cuisine} 
                  image={typeof recipe.image === 'string' ? recipe.image : (recipe.image?.publicId || '')} 
                />
                
                <div className="flex flex-wrap items-center gap-2">
                  <QuickEditButton slug={recipe.slug} />
                  <Link
                    href={`/ai?recipe=${recipe.slug}`}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-amber-700 px-5 text-sm font-semibold text-white transition hover:bg-amber-600 shadow-sm"
                  >
                    Modify with AI
                  </Link>
                </div>
              </div>
            </div>
            <p className="mt-4 text-stone-600 dark:text-stone-300 leading-relaxed">{recipe.description}</p>
          </div>

          <div className="space-y-6">
            <div className="h-[420px] w-full rounded-3xl overflow-hidden shadow-sm">
              <ImageWithSkeleton 
                src={getImageUrl(recipe.image, { width: 1200, height: 800 })}
                alt={typeof recipe.image === 'object' && recipe.image !== null ? recipe.image.alt : recipe.title}
                width={1200}
                height={800}
                unoptimized
                className="h-full w-full object-cover object-center" 
              />
            </div>

            <div className="space-y-4 rounded-3xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-950/95 dark:text-stone-100">
               <p><strong>Country:</strong> {recipe.country}</p>
               <p><strong>Difficulty:</strong> {recipe.difficulty}</p>
            </div>
          </div>

          <IngredientChecklist recipeTitle={recipe.title} ingredients={ingredientList} />
        </article>

        <aside className="space-y-6 lg:flex lg:flex-col lg:gap-6 animate-fade-in">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95">
            <h2 className="text-2xl font-semibold">Recipe story</h2>
            <p className="mt-4 text-stone-600 dark:text-stone-300">{recipe.history}</p>
            <div className="mt-6"><ServingScaler recipeSlug={recipe.slug} originalServings={recipe.servings} ingredients={ingredientList} /></div>
          </div>
        </aside>
      </section>
    </main>
  );
}