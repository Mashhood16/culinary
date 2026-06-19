'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import type { AdminRecipe } from '@/lib/recipe-store';

export const dynamic = 'force-dynamic';

// Zero-dependency inline Markdown-to-React parser
function parseMarkdownToReact(text: string) {
  if (!text) return null;

  const lines = text.split('\n');
  let inList = false;
  let inOrderedList = false;
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  function parseInlineMarkdown(str: string) {
    const parts = [];
    let index = 0;
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > index) {
        parts.push(str.substring(index, match.index));
      }
      if (match[1]) {
        parts.push(
          <strong key={match.index} className="font-semibold text-stone-955 dark:text-white">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(
          <em key={match.index} className="italic text-stone-800 dark:text-stone-200">
            {match[4]}
          </em>
        );
      }
      index = regex.lastIndex;
    }
    if (index < str.length) {
      parts.push(str.substring(index));
    }
    return parts.length > 0 ? parts : str;
  }

  function flushList() {
    if (inList) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-4 space-y-1.5 text-stone-700 dark:text-stone-300">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
    if (inOrderedList) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal pl-5 my-4 space-y-1.5 text-stone-700 dark:text-stone-300">
          {listItems}
        </ol>
      );
      listItems = [];
      inOrderedList = false;
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={idx} className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-6 mb-3">
          {parseInlineMarkdown(trimmed.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={idx} className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-5 mb-2">
          {parseInlineMarkdown(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={idx} className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-4 mb-2">
          {parseInlineMarkdown(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inOrderedList) flushList();
      inList = true;
      listItems.push(
        <li key={idx} className="text-stone-700 dark:text-stone-300 pl-1 leading-relaxed">
          {parseInlineMarkdown(trimmed.substring(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (inList) flushList();
      inOrderedList = true;
      const match = trimmed.match(/^\d+\.\s(.*)/);
      const content = match ? match[1] : trimmed;
      listItems.push(
        <li key={idx} className="text-stone-700 dark:text-stone-300 pl-1 leading-relaxed">
          {parseInlineMarkdown(content)}
        </li>
      );
    } else if (trimmed === '') {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={idx} className="my-2.5 leading-relaxed text-stone-700 dark:text-stone-300">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

function AIPageContent() {
  const searchParams = useSearchParams();
  const recipeSlug = searchParams.get('recipe') || '';
  const servingCount = searchParams.get('servings') || '';
  
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [selectedRecipeSlug, setSelectedRecipeSlug] = useState(recipeSlug || '');
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch the live database recipes on component mount
  useEffect(() => {
    async function fetchRecipes() {
      try {
        const res = await fetch('/api/admin/recipes', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const publicOnly = data.filter((r: AdminRecipe) => 
            r.status !== 'draft' && 
            r.status !== 'archived' && 
            r.status !== 'deleted'
          );
          setRecipes(publicOnly);
        }
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
      } finally {
        setLoadingRecipes(false);
      }
    }
    fetchRecipes();
  }, []);

  const recipe = useMemo(
    () => recipes.find((item) => item.slug === (selectedRecipeSlug || recipeSlug)),
    [recipes, recipeSlug, selectedRecipeSlug]
  );

  const [prompt, setPrompt] = useState('Suggest 3 ingredient substitutions for this recipe and explain why they work.');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipeQuery, setRecipeQuery] = useState(recipe?.title || '');

  useEffect(() => {
    setSelectedRecipeSlug(recipeSlug || '');
  }, [recipeSlug]);

  useEffect(() => {
    setRecipeQuery(recipe?.title || '');
  }, [recipe]);

  // Sets a clean, short prompt instruction in the visible textarea
  useEffect(() => {
    if (!recipe) return;

    const shortInstruction = servingCount
      ? `Scale this recipe for ${servingCount} people. Adjust ingredient quantities and mention any cooking-time or pan-size changes.`
      : 'Suggest 3 substitutions or ingredient swaps for this recipe and explain why they work.';

    setPrompt(shortInstruction);
  }, [recipe, servingCount]);

  async function handleAsk() {
    setLoading(true);
    setAnswer('');

    try {
      let finalPrompt = prompt;

      // Securely bundle the recipe details with the user's prompt in the background payload
      if (recipe) {
        const recipeContext = [
          `Recipe Name: ${recipe.title}`,
          `Cuisine: ${recipe.cuisine}`,
          `Meal Type: ${recipe.mealType}`,
          `Difficulty: ${recipe.difficulty}`,
          `Original Servings: ${recipe.servings}`,
          `Prep Time: ${recipe.prepTime} | Cook Time: ${recipe.cookTime}`,
          `Ingredients: ${(recipe.ingredients ?? []).join(', ')}`,
          `Steps: ${(recipe.steps ?? []).join(' ')}`,
        ].join('\n');

        finalPrompt = `You are an AI Food Scientist. Help the user adapt this recipe.\n\n[RECIPE DATA]\n${recipeContext}\n\n[USER INSTRUCTION]\n${prompt || 'Please suggest substitutions, scaling, or ingredient swaps and explain why they work.'}`;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: finalPrompt,
          type: 'modify' // Tells the API router to use your "Recipe Modifier" system instructions
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 font-sans">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700 font-medium">AI Food Scientist</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900 lg:text-5xl">Ask for substitutions, scaling, and food science help.</h1>
          <p className="mt-4 max-w-3xl text-stone-600">This page now gives you a real AI assistant for recipe tweaks, ingredient substitutions, serving-size changes, and practical cooking guidance.</p>

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
              placeholder={loadingRecipes ? "Loading recipes..." : "Type to search recipes..."}
              disabled={loadingRecipes}
              className="mt-3 w-full rounded-2xl border border-stone-300 bg-white p-3 text-sm text-stone-800 shadow-sm outline-none transition focus:border-amber-500"
            />
            <datalist id="recipe-options">
              {recipes.map((item) => (
                <option key={item.slug} value={item.title} />
              ))}
            </datalist>
            
            {recipe ? (
              <p className="mt-3 text-sm text-emerald-700 font-medium">Selected: {recipe.title}</p>
            ) : (
              <p className="mt-3 text-sm text-stone-500">
                {loadingRecipes ? "Checking recipe database..." : "Type a recipe name to search and choose one from the dropdown."}
              </p>
            )}

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
                onClick={() => setPrompt('Give me 3 substitutions for this recipe and explain why they work.')}
                className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:border-amber-400 hover:text-amber-700"
              >
                Try a substitutions prompt
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700">
            <p className="font-semibold text-stone-900">Example prompts to try</p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              <li>• Make this recipe vegetarian while keeping the same flavor profile.</li>
              <li>• Scale this recipe for 8 people and adjust cooking times.</li>
              <li>• Replace all dairy ingredients with plant-based alternatives.</li>
              <li>• Suggest substitutes for eggs and explain how they affect texture.</li>
              <li>• Make this recipe gluten-free with easy ingredient swaps.</li>
              <li>• Reduce the cooking time by suggesting faster techniques.</li>
            </ul>
          </div>

          {/* Response Container with Left Border Accent and Markdown rendering */}
          <div className="mt-6 rounded-2xl border-l-4 border-amber-600 bg-amber-50/10 p-5 dark:bg-stone-950/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-amber-800 dark:text-amber-500 mb-2">
              <svg className={`h-4 w-4 text-amber-600 ${loading ? 'animate-bounce' : 'animate-pulse'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm12 7a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1zM11 5a1 1 0 01.1.002l1 1a1 1 0 010 1.414l-1 1A1 1 0 0110 8V5zm-4 9a1 1 0 011-1h1a1 1 0 110 2H8v1a1 1 0 11-2 0v-1z" />
              </svg>
              <span>AI Scientist Response</span>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-stone-200/80 dark:bg-stone-700/80 rounded w-3/4"></div>
                <div className="h-4 bg-stone-200/80 dark:bg-stone-700/80 rounded w-5/6"></div>
                <div className="h-4 bg-stone-200/80 dark:bg-stone-700/80 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="mt-2 text-stone-700 dark:text-stone-300 text-sm leading-relaxed 
                [&_strong]:font-semibold [&_strong]:text-stone-900 dark:[&_strong]:text-stone-100
                [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:text-stone-900 dark:[&_h1]:text-stone-100
                [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-stone-900 dark:[&_h2]:text-stone-100
                [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-stone-900 dark:[&_h3]:text-stone-100
                [&_p]:my-2 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ul]:space-y-1.5
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_ol]:space-y-1.5
                [&_li]:text-stone-700 dark:[&_li]:text-stone-300
                [&_code]:rounded [&_code]:bg-stone-200/60 dark:[&_code]:bg-stone-800/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs"
              >
                {mounted ? (
                  parseMarkdownToReact(answer) || (
                    <p className="text-stone-500 dark:text-stone-400">
                      Ask a question to get practical recipe help.
                    </p>
                  )
                ) : (
                  <p className="text-stone-500 animate-pulse">Loading...</p>
                )}
              </div>
            )}
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