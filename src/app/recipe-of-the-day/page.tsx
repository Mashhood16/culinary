'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import type { AdminRecipe } from '@/lib/recipe-store';
import { summarizeMethodStep } from '@/lib/method-summary';

export const dynamic = 'force-dynamic';

export default function RecipeOfTheDayPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900" />}> 
      <RecipeOfTheDayContent />
    </Suspense>
  );
}

function RecipeOfTheDayContent() {
  const searchParams = useSearchParams();
  const requestedRecipe = searchParams.get('recipe') || '';

  // Define recipes and featured as dynamic state variables
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [featured, setFeatured] = useState<AdminRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  const ingredientList = useMemo(() => {
    if (!featured) {
      return [];
    }

    return featured.ingredients?.length
      ? featured.ingredients
      : [
          `${featured.foodType || 'Signature'} base ingredient`,
          `${featured.cuisine} spice blend`,
          'Fresh aromatics or herbs',
          'Seasonal vegetables or protein',
          'Cooked grains, noodles, or bread',
          'Finishing sauce, garnish, or acid',
        ];
  }, [featured]);

  const methodSteps = useMemo(() => {
    if (!featured) {
      return [];
    }

    const baseSteps = featured.steps?.length
      ? featured.steps.map((step) => summarizeMethodStep(step)).filter(Boolean)
      : [
          `Prep ingredients and set out your pan.`,
          `Cook aromatics, then add the main ingredient and spices.`,
          `Add sauce or stock and simmer gently.`,
          `Add grains or noodles if needed, then cook until tender.`,
          `Taste and finish with herbs or acid.`,
        ];

    return baseSteps.map((step) => step.replace(/\.$/, ''));
  }, [featured]);

  function pickRandomRecipe() {
    if (!recipes.length) {
      setFeatured(null);
      return;
    }

    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)] ?? recipes[0];
    setFeatured(randomRecipe ?? null);
  }

  // Fetch current database recipes in real-time
  useEffect(() => {
    async function loadRecipes() {
      try {
        const res = await fetch('/api/admin/recipes', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          // Filter out recipes that are draft, archived, or deleted
          const publicOnly = data.filter((r: AdminRecipe) => 
            r.status !== 'draft' && 
            r.status !== 'archived' && 
            r.status !== 'deleted'
          );
          setRecipes(publicOnly);

          // Find requestedRecipe or select random if empty or not found
          const selectedRecipe = publicOnly.find((recipe) => recipe.slug === requestedRecipe);
          if (selectedRecipe) {
            setFeatured(selectedRecipe);
          } else if (publicOnly.length > 0) {
            const randomRecipe = publicOnly[Math.floor(Math.random() * publicOnly.length)] ?? publicOnly[0];
            setFeatured(randomRecipe ?? null);
          } else {
            setFeatured(null);
          }
        }
      } catch (err) {
        console.error("Failed to load recipes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecipes();
  }, [requestedRecipe]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 font-sans">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700 font-medium">Recipe of the Day</p>
          
          {loading ? (
            <p className="mt-6 text-stone-600 animate-pulse">Loading recipe information...</p>
          ) : featured ? (
            <>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-stone-500 font-medium">{featured.cuisine || 'Global'}</p>
                  <h1 className="mt-1 text-4xl font-semibold text-stone-900">{featured.title}</h1>
                </div>
                <button
                  type="button"
                  onClick={pickRandomRecipe}
                  className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
                >
                  Surprise me again
                </button>
              </div>
              <p className="mt-4 text-stone-600 leading-relaxed">{featured.description}</p>
              {featured.image ? (
                <Image src={featured.image} alt={featured.title} width={900} height={540} className="mt-6 h-72 w-full rounded-3xl object-cover" />
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-stone-700">
                <span className="rounded-full bg-stone-100 px-3 py-1">Prep {featured.prepTime}</span>
                <span className="rounded-full bg-stone-100 px-3 py-1">Cook {featured.cookTime}</span>
                {featured.totalTime ? <span className="rounded-full bg-stone-100 px-3 py-1">Total {featured.totalTime}</span> : null}
                <span className="rounded-full bg-stone-100 px-3 py-1">Serves {featured.servings}</span>
                <span className="rounded-full bg-stone-100 px-3 py-1">{featured.difficulty}</span>
              </div>
              <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
                <p><strong>History:</strong> {featured.history}</p>
                <p className="mt-2"><strong>Country:</strong> {featured.country}</p>
                <p className="mt-2"><strong>Food type:</strong> {featured.foodType}</p>
                <p className="mt-2"><strong>Meal type:</strong> {featured.mealType}</p>
                <p className="mt-2"><strong>Nutrition:</strong> {featured.calories}</p>
                <p className="mt-2"><strong>Rating:</strong> {featured.rating}/5</p>
              </div>
              <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-6">
                <h2 className="text-xl font-semibold text-stone-900">Ingredients</h2>
                <ul className="mt-4 space-y-2 text-sm text-stone-700">
                  {ingredientList.map((item, index) => <li key={`${item}-${index}`} className="rounded-2xl bg-white px-3 py-2">• {item}</li>)}
                </ul>
              </div>
              <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-stone-900">Method</h2>
                <ol className="mt-4 space-y-3 text-sm text-stone-700">
                  {methodSteps.map((step, index) => (
                    <li key={`${featured.slug}-${index}`} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 shadow-sm transition hover:border-amber-300 hover:bg-amber-50/60 animate-fade-in">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-700 text-sm font-semibold text-white">{index + 1}</span>
                        <p className="leading-6">{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <p className="mt-4 text-stone-600">No recipe data is available right now. Add recipes to the catalog to restore this page.</p>
          )}
        </article>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Why it stands out</h2>
            <ul className="mt-4 space-y-3 text-sm text-stone-600">
              <li>• Practical recipe suggestions and substitutions</li>
              <li>• Easy adaptation for vegetarian, vegan, and high-protein needs</li>
              <li>• Clear food science tips for better texture and flavor</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Next featured dishes</h2>
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              {recipes.slice(1, 4).map((recipe) => (
                <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="block rounded-2xl border border-stone-200 p-3 hover:bg-stone-50 transition">{recipe.title}</Link>
              ))}
              {!loading && recipes.length <= 1 ? (
                <p className="text-stone-500 text-xs">No additional featured dishes currently available.</p>
              ) : null}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}