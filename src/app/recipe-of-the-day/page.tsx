'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { recipes } from '@/lib/recipes';

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
  const [featured, setFeatured] = useState(() => {
    return recipes.find((recipe) => recipe.slug === requestedRecipe) ?? recipes[0];
  });

  const ingredientList = useMemo(() => {
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
    return featured.steps?.length
      ? featured.steps
      : [
          `Prep all ingredients for ${featured.title.toLowerCase()} and set your cookware out before you start.`,
          `Build the flavor base with the spice blend, aromatics, and any fresh vegetables or protein you are using.`,
          `Cook the main ingredient until fragrant and evenly colored, keeping the texture true to the dish style.`,
          `Add the starch or grains and fold in sauces, herbs, or finishing elements to bring the dish together.`,
          `Taste, adjust seasoning, and serve with the suggested accompaniments for the best texture and balance.`,
        ];
  }, [featured]);

  function pickRandomRecipe() {
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)] ?? recipes[0];
    setFeatured(randomRecipe);
  }

  useEffect(() => {
    const selectedRecipe = recipes.find((recipe) => recipe.slug === requestedRecipe);

    if (selectedRecipe) {
      setFeatured(selectedRecipe);
      return;
    }

    pickRandomRecipe();
  }, [requestedRecipe]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Recipe of the Day</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-stone-500">{featured.cuisine}</p>
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
          <p className="mt-4 text-stone-600">{featured.description}</p>
          <img src={featured.image} alt={featured.title} className="mt-6 h-72 w-full rounded-3xl object-cover" />
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-stone-700">
            <span className="rounded-full bg-stone-100 px-3 py-1">Prep {featured.prepTime}</span>
            <span className="rounded-full bg-stone-100 px-3 py-1">Cook {featured.cookTime}</span>
            {featured.totalTime ? <span className="rounded-full bg-stone-100 px-3 py-1">Total {featured.totalTime}</span> : null}
            <span className="rounded-full bg-stone-100 px-3 py-1">Serves {featured.servings}</span>
            <span className="rounded-full bg-stone-100 px-3 py-1">{featured.difficulty}</span>
            {featured.alcoholFree ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">Alcohol-free</span> : null}
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
              {ingredientList.map((item) => <li key={item} className="rounded-2xl bg-white px-3 py-2">• {item}</li>)}
            </ul>
          </div>
          <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-stone-900">Method</h2>
            <ol className="mt-4 space-y-3 text-sm text-stone-700">
              {methodSteps.map((step, index) => <li key={step} className="rounded-2xl bg-stone-50 px-3 py-3">{index + 1}. {step}</li>)}
            </ol>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Why it stands out</h2>
            <ul className="mt-4 space-y-3 text-sm text-stone-600">
              <li>• Fully alcohol-free recipe suggestions and substitutions</li>
              <li>• Easy adaptation for vegetarian, vegan, and high-protein needs</li>
              <li>• Clear food science tips for better texture and flavor</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Next featured dishes</h2>
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              {recipes.slice(1, 4).map((recipe) => (
                <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="block rounded-2xl border border-stone-200 p-3 hover:bg-stone-50">{recipe.title}</Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
