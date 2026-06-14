'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { cuisines, mealTypes, recipeTags, recipes } from '@/lib/recipes';

function RecipesPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedMeal, setSelectedMeal] = useState('All');

  useEffect(() => {
    const cuisineParam = searchParams.get('cuisine');
    if (cuisineParam && cuisines.includes(cuisineParam)) {
      setSelectedCuisine(cuisineParam);
    }
  }, [searchParams]);

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesQuery =
        !q ||
        [recipe.title, recipe.cuisine, recipe.country, recipe.description, recipe.foodType, ...recipe.tags, ...(recipe.ingredients ?? []), ...(recipe.steps ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(q);

      const matchesCuisine = selectedCuisine === 'All' || recipe.cuisine === selectedCuisine;
      const matchesTag = selectedTag === 'All' || recipe.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase());
      const matchesMeal = selectedMeal === 'All' || recipe.mealType.toLowerCase() === selectedMeal.toLowerCase();

      return matchesQuery && matchesCuisine && matchesTag && matchesMeal;
    });
  }, [query, selectedCuisine, selectedTag, selectedMeal]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 transition-colors duration-200 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900/95 dark:text-stone-100">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Recipe Library</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900 dark:text-stone-100 lg:text-5xl">Explore cuisines, trends, and ingredients.</h1>
          <p className="mt-4 max-w-3xl text-stone-600 dark:text-stone-300">Search by ingredient, cuisine, meal type, or tag and discover a much larger global collection of recipes.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <aside className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95 dark:text-stone-100">
            <h2 className="text-xl font-semibold dark:text-stone-100">Filters</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes, ingredients, or cuisines"
              className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />

            <label className="mt-4 block text-sm font-semibold text-stone-700 dark:text-stone-200">Cuisine</label>
            <select value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value)} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100">
              <option value="All">All cuisines</option>
              {cuisines.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <label className="mt-4 block text-sm font-semibold text-stone-700 dark:text-stone-200">Tag</label>
            <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100">
              <option value="All">All tags</option>
              {recipeTags.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <label className="mt-4 block text-sm font-semibold text-stone-700 dark:text-stone-200">Meal type</label>
            <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100">
              <option value="All">All meal types</option>
              {mealTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <button onClick={() => { setQuery(''); setSelectedCuisine('All'); setSelectedTag('All'); setSelectedMeal('All'); }} className="mt-5 rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 dark:border-stone-700 dark:text-stone-200">Reset filters</button>
          </aside>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/95 dark:text-stone-100">
              <p className="text-sm text-stone-600 dark:text-stone-300">Showing {filteredRecipes.length} of {recipes.length} recipes</p>
              <button onClick={() => { setQuery(''); setSelectedCuisine('All'); setSelectedTag('All'); setSelectedMeal('All'); }} className="rounded-full bg-amber-700 px-4 py-2 text-sm text-white">Clear all</button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredRecipes.map((recipe) => (
                <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900/95">
                  <img src={recipe.image} alt={recipe.title} className="h-44 w-full object-cover" />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-700">{recipe.cuisine}</p>
                    <h3 className="mt-2 text-xl font-semibold text-stone-900">{recipe.title}</h3>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{recipe.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-700 dark:text-stone-200">
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 dark:bg-stone-800">{recipe.mealType}</span>
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 dark:bg-stone-800">{recipe.difficulty}</span>
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 dark:bg-stone-800">{recipe.calories}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {!filteredRecipes.length && (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600 shadow-sm dark:border-stone-700 dark:bg-stone-900/95 dark:text-stone-300">No recipes match these filters yet. Try a different cuisine, tag, or search term.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900" />}> 
      <RecipesPageContent />
    </Suspense>
  );
}
