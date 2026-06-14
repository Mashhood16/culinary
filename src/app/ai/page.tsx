'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { recipes } from '@/lib/recipes';
import { formatAIResponse } from '@/lib/format-ai-response';

function AIPageContent() {
  const searchParams = useSearchParams();
  const recipeSlug = searchParams.get('recipe') || '';
  const servingCount = searchParams.get('servings') || '';
  const [selectedRecipeSlug, setSelectedRecipeSlug] = useState(recipeSlug || '');
  const recipe = useMemo(
    () => recipes.find((item) => item.slug === (selectedRecipeSlug || recipeSlug)),
    [recipeSlug, selectedRecipeSlug]
  );
  const [prompt, setPrompt] = useState('Help me adapt this recipe for 6 people and make it dairy-free.');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipeQuery, setRecipeQuery] = useState(recipe?.title || '');

  useEffect(() => {
    setSelectedRecipeSlug(recipeSlug || '');
  }, [recipeSlug]);

  useEffect(() => {
    setRecipeQuery(recipe?.title || '');
  }, [recipe]);

  useEffect(() => {
    if (!recipe) return;

    const recipeContext = [
      `Recipe: ${recipe.title}`,
      `Cuisine: ${recipe.cuisine}`,
      `Meal type: ${recipe.mealType}`,
      `Difficulty: ${recipe.difficulty}`,
      `Prep: ${recipe.prepTime} | Cook: ${recipe.cookTime}`,
      `Serves: ${recipe.servings}`,
      `Tags: ${recipe.tags.join(', ')}`,
      `Description: ${recipe.description}`,
      `Ingredients: ${(recipe.ingredients ?? []).join(', ')}`,
      `Steps: ${(recipe.steps ?? []).join(' ')}`,
    ].join('\n');

    const servingInstruction = servingCount
      ? `Scale this recipe for ${servingCount} people. Adjust ingredient quantities and mention any cooking-time or pan-size changes.`
      : 'Please suggest substitutions, scaling, or alcohol-free changes and explain why they work.';

    setPrompt(`Adapt this recipe for a home cook.\n\n${recipeContext}\n\n${servingInstruction}`);
  }, [recipe, servingCount]);

  async function handleAsk() {
    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: recipe
            ? `${prompt}\n\nRecipe context for this request:\n${recipe.title} | ${recipe.cuisine} | ${recipe.mealType} | ${recipe.description}\nIngredients: ${(recipe.ingredients ?? []).join(', ')}\nSteps: ${(recipe.steps ?? []).join(' ')}`
            : prompt,
        }),
      });

      const data = await response.json();
      setAnswer(data.answer || 'No answer returned.');
    } catch (error) {
      setAnswer('Unable to contact the AI helper right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">AI Food Scientist</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900 lg:text-5xl">Ask for substitutions, scaling, and food science help.</h1>
          <p className="mt-4 max-w-3xl text-stone-600">This page now gives you a real AI assistant for recipe tweaks, alcohol-free alternatives, serving-size changes, and practical cooking guidance.</p>

          <div className="mt-6 rounded-3xl bg-stone-50 p-6">
            <label className="text-sm font-semibold text-stone-900" htmlFor="recipe-search">Search and choose a recipe</label>
            <input
              id="recipe-search"
              list="recipe-options"
              value={recipeQuery}
              onChange={(e) => {
                const value = e.target.value;
                setRecipeQuery(value);

                const matchedRecipe = recipes.find(
                  (item) => item.title.toLowerCase() === value.trim().toLowerCase()
                );

                setSelectedRecipeSlug(matchedRecipe?.slug || '');
              }}
              placeholder="Type to search recipes..."
              className="mt-3 w-full rounded-2xl border border-stone-300 bg-white p-3 text-sm text-stone-800 shadow-sm outline-none transition focus:border-amber-500"
            />
            <datalist id="recipe-options">
              {recipes.map((item) => (
                <option key={item.slug} value={item.title} />
              ))}
            </datalist>
            {recipe ? <p className="mt-3 text-sm text-emerald-700">Selected: {recipe.title}</p> : <p className="mt-3 text-sm text-stone-500">Type a recipe name to search and choose one from the dropdown.</p>}

            <label className="mt-5 block text-sm font-semibold text-stone-900" htmlFor="ai-prompt">What do you want help with?</label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-stone-300 bg-white p-4 text-sm text-stone-800 shadow-sm outline-none ring-0 transition focus:border-amber-500"
              rows={5}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleAsk}
                disabled={loading}
                className="rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {loading ? 'Thinking…' : 'Ask AI'}
              </button>
              <button
                onClick={() => setPrompt('Give me 3 alcohol-free substitutions for this recipe and explain why they work.')}
                className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:border-amber-400 hover:text-amber-700"
              >
                Try an alcohol-free prompt
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700">
            <p className="font-semibold text-stone-900">Example prompts</p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              <li>• Make this recipe vegetarian without losing the original flavor.</li>
              <li>• Scale it for six people and adjust cook time.</li>
              <li>• Replace dairy ingredients with plant-based options.</li>
              <li>• Suggest an alcohol-free substitute for wine or brandy.</li>
            </ul>
          </div>

          <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Response</p>
            <p className="mt-3 whitespace-pre-wrap text-stone-700">{formatAIResponse(answer) || 'Ask a question to get practical recipe help.'}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function AIPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900" />}> 
      <AIPageContent />
    </Suspense>
  );
}
