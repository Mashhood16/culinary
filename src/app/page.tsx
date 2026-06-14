'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { recipes, cuisines, type Recipe } from '@/lib/recipes';
import { formatAIResponse } from '@/lib/format-ai-response';

export default function Home() {
  const [featured, setFeatured] = useState<Recipe | null>(() => {
    if (!recipes.length) return null;
    return recipes[Math.floor(Math.random() * recipes.length)] ?? recipes[0] ?? null;
  });
  const popularCuisines = useMemo(() => {
    return cuisines
      .map((cuisine) => ({
        name: cuisine,
        count: recipes.filter((recipe) => recipe.cuisine === cuisine).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, []);

  const recipeHighlights = useMemo(() => recipes.slice(0, 4), []);
  const totalRecipes = recipes.length;
  const totalCuisines = cuisines.length;
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAskAI() {
    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt || 'Suggest 3 recipes I can make with common pantry ingredients and explain substitutions.' }),
      });
      const data = await response.json();
      setAnswer(data.answer || 'No answer returned.');
    } catch {
      setAnswer('AI assistance is currently unavailable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 transition-colors duration-200 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <article className="glass-card rounded-[32px] p-8 soft-ring dark:border-stone-800 dark:bg-stone-900/95">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Discover the world, one recipe at a time</p>
          <h1 className="mt-4 text-4xl font-semibold text-stone-900 dark:text-stone-100 lg:text-6xl">Culnarriest</h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-300">Explore global recipes with a premium, safe recipe approach and AI-assisted food science guidance.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/recipes" className="rounded-full bg-amber-700 px-5 py-3 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-800">Explore recipes</Link>
            <Link href="/ai" className="rounded-full border border-stone-300 bg-white/80 px-5 py-3 text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100">Ask the AI chef</Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950/80">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Recipes</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">{totalRecipes}</p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950/80">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Cuisines</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">{totalCuisines}</p>
            </div>
          </div>
        </article>

        <aside className="rounded-[32px] border border-stone-800 bg-stone-950 p-8 text-stone-100 shadow-[0_24px_60px_rgba(15,23,42,0.35)]">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Recipe of the Day</p>
          {featured ? (
            <>
              <h2 className="mt-3 text-2xl font-semibold">{featured.title}</h2>
              <p className="mt-3 text-stone-300">{featured.description}</p>
              <Image src={featured.image} alt={featured.title} width={800} height={480} className="mt-5 h-48 w-full rounded-3xl object-cover" />
              <Link href={`/recipe-of-the-day?recipe=${featured.slug}`} className="mt-5 inline-block rounded-full bg-amber-500 px-4 py-2 text-stone-950 transition hover:-translate-y-0.5 hover:bg-amber-400">View full recipe</Link>
            </>
          ) : (
            <p className="mt-3 text-stone-300">Recipe data is currently unavailable. Add recipes to the catalog to restore the homepage highlights.</p>
          )}
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {recipeHighlights.map((recipe) => (
            <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="glass-card rounded-[28px] p-4 transition duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900/95">
              <Image src={recipe.image} alt={recipe.title} width={800} height={480} className="h-36 w-full rounded-2xl object-cover" />
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-amber-700">{recipe.cuisine}</p>
              <h3 className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-100">{recipe.title}</h3>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{recipe.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-10 lg:grid-cols-[1fr_1fr] lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-2xl font-semibold dark:text-stone-100">Popular cuisines</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {popularCuisines.map((item) => (
              <Link
                key={item.name}
                href={`/recipes?cuisine=${encodeURIComponent(item.name)}`}
                className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700 transition hover:bg-amber-100 hover:text-amber-800 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-amber-900 dark:hover:text-amber-100"
              >
                {item.name} ({item.count})
              </Link>
            ))}
          </div>
        </article>
        <article className="glass-card rounded-3xl p-6 dark:border-stone-800 dark:bg-stone-900/95">
          <h2 className="text-2xl font-semibold dark:text-stone-100">Cook with what you have</h2>
          <p className="mt-3 text-stone-600 dark:text-stone-300">Type ingredients you already have, then ask the AI Food Scientist for recipe ideas and substitutions.</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="Try: chicken, tomato, yogurt, rice, vegetarian, dairy-free..."
          />
          <button
            onClick={handleAskAI}
            disabled={loading}
            className="mt-4 rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {loading ? 'Thinking…' : 'Ask AI'}
          </button>
          <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
            <p className="font-semibold text-stone-900 dark:text-stone-100">AI suggestion</p>
            <p className="mt-2 whitespace-pre-wrap">{formatAIResponse(answer) || 'Enter ingredients or dietary needs to get recipe ideas from the AI helper.'}</p>
          </div>
        </article>
      </section>
    </main>
  );
}
