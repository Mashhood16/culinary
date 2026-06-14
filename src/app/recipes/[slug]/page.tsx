'use client';

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { recipes as fallbackRecipes, type Recipe } from '@/lib/recipes';
import { summarizeMethodStep } from '@/lib/method-summary';
import ServingScaler from './ServingScaler';

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const [recipe, setRecipe] = useState<Recipe | null>(() => fallbackRecipes.find((item) => item.slug === params.slug) ?? null);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/recipes')
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted) return;

        const nextRecipe = Array.isArray(data)
          ? data.find((item: Recipe) => item.slug === params.slug) ?? null
          : fallbackRecipes.find((item) => item.slug === params.slug) ?? null;

        setRecipe(nextRecipe);
      })
      .catch(() => {
        if (isMounted) {
          setRecipe(fallbackRecipes.find((item) => item.slug === params.slug) ?? null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [params.slug]);

  if (!recipe) notFound();

  const ingredientList = recipe.ingredients?.length
    ? recipe.ingredients
    : [
        `${recipe.foodType || 'Signature'} base ingredient`,
        `${recipe.cuisine} spice blend`,
        'Fresh aromatics or herbs',
        'Seasonal vegetables or protein',
        'Cooked grains, noodles, or bread',
        'Finishing sauce, garnish, or acid',
      ];

  const baseMethodSteps = recipe.steps?.length
    ? recipe.steps.map((step) => summarizeMethodStep(step)).filter(Boolean)
    : [
        `Prep ingredients and set out your pan.`,
        `Cook aromatics, then add the main ingredient and spices.`,
        `Add sauce or stock and simmer gently.`,
        `Add grains or noodles if needed, then cook until tender.`,
        `Taste and finish with herbs or acid.`,
      ];

  const methodSteps = baseMethodSteps.map((step) => step.replace(/\.$/, ''));

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:px-10">
        <article className="space-y-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-amber-700">{recipe.cuisine}</p>
                <h1 className="mt-3 text-4xl font-semibold text-stone-900 dark:text-stone-100">{recipe.title}</h1>
              </div>
              <Link
                href={`/ai?recipe=${recipe.slug}`}
                className="inline-flex items-center justify-center rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Modify with AI
              </Link>
            </div>
            <p className="mt-4 text-stone-600 dark:text-stone-300">{recipe.description}</p>
          </div>

          <div className="space-y-6">
            <Image src={recipe.image} alt={recipe.title} width={1200} height={800} className="h-[420px] w-full rounded-3xl object-cover object-center" />

            <div className="space-y-4 rounded-3xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-950/95 dark:text-stone-100">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Recipe details</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-stone-900">Prep {recipe.prepTime}</span>
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-stone-900">Cook {recipe.cookTime}</span>
                  {recipe.totalTime ? <span className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-stone-900">Total {recipe.totalTime}</span> : null}
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-stone-900">Serves {recipe.servings}</span>
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-stone-900">{recipe.difficulty}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p><strong>Food type:</strong> {recipe.foodType}</p>
                <p><strong>Meal type:</strong> {recipe.mealType}</p>
                <p><strong>Calories:</strong> {recipe.calories}</p>
                {recipe.rating ? <p><strong>Rating:</strong> {recipe.rating}/5</p> : null}
              </div>

              {recipe.tags?.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-200">{tag}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <section className="rounded-3xl border border-stone-200 bg-stone-50 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950/95">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Ingredients</h2>
            <ul className="mt-4 grid gap-3 text-sm text-stone-700 dark:text-stone-100">
              {ingredientList.map((ingredient) => (
                <li key={ingredient} className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-stone-900">{ingredient}</li>
              ))}
            </ul>
          </section>

          {(recipe.foodSafetyNote || recipe.editorialNote) && (
            <section className="rounded-3xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-950/95 dark:text-stone-100">
              <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Notes</h2>
              <div className="mt-4 space-y-4">
                <div className="space-y-3 text-sm text-stone-700 dark:text-stone-100">
                  <p>Use high-quality spices, fresh aromatics, and the correct cooking vessel for the best texture.</p>
                  <p>Let the dish rest briefly before serving to allow flavors to settle and liquids to absorb.</p>
                  <p>Adjust salt and acidity last so the final seasoning stays balanced.</p>
                </div>
                {recipe.foodSafetyNote ? <p>{recipe.foodSafetyNote}</p> : null}
                {recipe.editorialNote ? <p>{recipe.editorialNote}</p> : null}
              </div>
            </section>
          )}

        </article>

        <aside className="space-y-6 lg:flex lg:flex-col lg:gap-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Recipe story</h2>
              <p className="mt-4 text-stone-600 dark:text-stone-300">{recipe.history}</p>
            </div>
            <div className="mt-6">
              <ServingScaler recipeSlug={recipe.slug} originalServings={recipe.servings} ingredients={ingredientList} />
            </div>
          </div>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Method</h2>
            <ol className="mt-4 space-y-4 text-sm text-stone-700 dark:text-stone-100">
              {methodSteps.map((step, index) => (
                <li key={`${recipe.slug}-${index}`} className="rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 shadow-sm transition hover:border-amber-300 hover:bg-amber-50/60 dark:border-stone-800 dark:bg-stone-950/95 dark:hover:border-amber-700 dark:hover:bg-stone-900">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-700 text-sm font-semibold text-white">{index + 1}</span>
                    <p className="leading-6">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

        </aside>
      </section>
    </main>
  );
}
