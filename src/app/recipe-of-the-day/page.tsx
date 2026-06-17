'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import type { AdminRecipe } from '@/lib/recipe-store';
import { summarizeMethodStep } from '@/lib/method-summary';
import QuickEditButton from '@/components/QuickEditButton';

export const dynamic = 'force-dynamic';

export default function RecipeOfTheDayPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-stone-50 p-10 text-center font-sans">Loading...</main>}> 
      <RecipeOfTheDayContent />
    </Suspense>
  );
}

function RecipeOfTheDayContent() {
  const [featured, setFeatured] = useState<AdminRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch live recipes and pick a random one on mount
  async function loadRandomRecipe() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/recipes', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      
      const recipes: AdminRecipe[] = await res.json();
      const publishedRecipes = recipes.filter(r => r.status === 'published');
      
      if (publishedRecipes.length > 0) {
        const randomIndex = Math.floor(Math.random() * publishedRecipes.length);
        setFeatured(publishedRecipes[randomIndex]);
      } else {
        setFeatured(null);
      }
    } catch (err) {
      console.error("Error loading recipe:", err);
      setFeatured(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRandomRecipe();
  }, []);

  if (loading) return <main className="min-h-screen bg-stone-50 p-10 text-center font-sans">Loading daily inspiration...</main>;

  if (!featured) {
    return (
      <main className="min-h-screen bg-stone-50 p-10 text-center font-sans">
        <h1 className="text-2xl font-bold text-stone-900">No published recipes found.</h1>
        <p className="mt-2 text-stone-600">Ensure you have recipes set to "published" in your admin panel.</p>
        <Link href="/" className="mt-4 inline-block text-amber-700 underline">Back to home</Link>
      </main>
    );
  }

  const methodSteps = (featured.steps && featured.steps.length > 0) 
    ? featured.steps.map((step) => summarizeMethodStep(step)) 
    : ["Follow the detailed instructions on the main recipe page."];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 p-6 md:p-12 font-sans">
      <div className="mx-auto max-w-4xl bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-stone-200">
        <div className="flex justify-between items-start mb-6">
          <Link href="/" className="text-sm font-semibold text-amber-700 hover:underline">← Back to Home</Link>
          <div className="flex gap-2">
            <button 
                onClick={loadRandomRecipe} 
                className="text-sm font-semibold text-amber-700 hover:underline"
            >
                ↻ New Random Recipe
            </button>
            <QuickEditButton slug={featured.slug} />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold">{featured.title}</h1>
        <p className="text-sm uppercase tracking-wider text-amber-600 font-semibold mt-2">{featured.cuisine}</p>
        
        {featured.image && (
          <Image 
            src={featured.image} 
            alt={featured.title} 
            width={800} 
            height={400} 
            className="mt-6 w-full h-[300px] object-cover rounded-3xl"
          />
        )}

        <p className="mt-6 text-lg text-stone-700 leading-relaxed">{featured.description}</p>
        
        <div className="mt-8">
            <h3 className="text-2xl font-semibold">Ingredients</h3>
            <ul className="mt-4 list-disc list-inside space-y-2 text-stone-750">
              {featured.ingredients?.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
        </div>

        <div className="mt-8">
            <h3 className="text-2xl font-semibold">Method</h3>
            <ol className="mt-4 list-decimal list-inside space-y-4 text-stone-750 leading-relaxed">
              {methodSteps.map((step, idx) => <li key={idx}>{step}</li>)}
            </ol>
        </div>
      </div>
    </main>
  );
}