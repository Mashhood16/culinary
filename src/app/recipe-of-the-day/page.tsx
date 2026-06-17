'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { AdminRecipe } from '@/lib/recipe-store';
import { summarizeMethodStep } from '@/lib/method-summary';
import QuickEditButton from '@/components/QuickEditButton';

export const dynamic = 'force-dynamic';

export default function RecipeOfTheDayPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-stone-50 flex items-center justify-center">Loading...</main>}> 
      <RecipeOfTheDayContent />
    </Suspense>
  );
}

function RecipeOfTheDayContent() {
  const searchParams = useSearchParams();
  const requestedSlug = searchParams.get('recipe');

  const [featured, setFeatured] = useState<AdminRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch live recipes from the server
        const res = await fetch('/api/recipes', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        
        const recipes: AdminRecipe[] = await res.json();
        
        if (recipes.length === 0) {
          setFeatured(null);
        } else {
          // If a slug was requested, find it. Otherwise, pick a random one from the live list.
          const found = requestedSlug 
            ? recipes.find(r => r.slug === requestedSlug) 
            : recipes[Math.floor(Math.random() * recipes.length)];
          
          setFeatured(found || recipes[0]);
        }
      } catch (err) {
        console.error("Error loading recipe:", err);
        setFeatured(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [requestedSlug]);

  if (loading) return <main className="min-h-screen bg-stone-50 p-10 text-center">Loading...</main>;

  if (!featured) {
    return (
      <main className="min-h-screen bg-stone-50 p-10 text-center">
        <h1 className="text-2xl font-bold">No recipe data available.</h1>
        <p>Add recipes in the admin panel to restore this page.</p>
        <Link href="/" className="text-amber-700 underline">Back to home</Link>
      </main>
    );
  }

  const methodSteps = (featured.steps && featured.steps.length > 0) 
    ? featured.steps.map((step) => summarizeMethodStep(step)) 
    : ["Follow the detailed instructions on the main recipe page."];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 p-6 md:p-12 font-sans">
      <div className="mx-auto max-w-4xl bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-stone-200">
        <div className="flex justify-between items-start">
          <Link href="/" className="text-sm font-semibold text-amber-700 hover:underline">← Back to Home</Link>
          <QuickEditButton slug={featured.slug} />
        </div>
        
        <h1 className="mt-6 text-4xl font-bold">{featured.title}</h1>
        <p className="text-sm uppercase tracking-wider text-amber-600 font-semibold mt-2">{featured.cuisine}</p>
        
        {featured.image && (
          <Image src={featured.image} alt={featured.title} width={800} height={400} className="mt-6 w-full h-[300px] object-cover rounded-3xl" />
        )}

        <p className="mt-6 text-lg text-stone-700">{featured.description}</p>
        
        <div className="mt-8">
            <h3 className="text-2xl font-semibold">Ingredients</h3>
            <ul className="mt-4 list-disc list-inside space-y-2">
              {featured.ingredients?.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
        </div>

        <div className="mt-8">
            <h3 className="text-2xl font-semibold">Method</h3>
            <ol className="mt-4 list-decimal list-inside space-y-4">
              {methodSteps.map((step, idx) => <li key={idx}>{step}</li>)}
            </ol>
        </div>
      </div>
    </main>
  );
}