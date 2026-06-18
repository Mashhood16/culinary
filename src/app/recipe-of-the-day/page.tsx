import Link from 'next/link';
import Image from 'next/image';
import { loadPublicRecipes } from '@/lib/recipe-store';
import { summarizeMethodStep } from '@/lib/method-summary';
import QuickEditButton from '@/components/QuickEditButton';

import { getImageUrl } from '@/lib/recipe-image';


// 1. Force the page to re-randomize every time, but render it on the server.
export const revalidate = 0; 

export default async function RecipeOfTheDayPage() {
  // 2. Fetch data directly on the server (No more loading spinners!)
  const recipes = await loadPublicRecipes();
  const publishedRecipes = recipes.filter(r => r.status === 'published');
  
  const featured = publishedRecipes.length > 0 
    ? publishedRecipes[Math.floor(Math.random() * publishedRecipes.length)] 
    : null;

  if (!featured) {
    return (
      <main className="min-h-screen bg-stone-50 p-10 text-center font-sans">
        <h1 className="text-2xl font-bold">No published recipes found.</h1>
        <p className="mt-2 text-stone-600">Please publish a recipe in the admin panel.</p>
        <Link href="/" className="mt-4 inline-block text-amber-700 underline">Back to home</Link>
      </main>
    );
  }

  const methodSteps = (featured.steps && featured.steps.length > 0) 
    ? featured.steps.map((step) => summarizeMethodStep(step)) 
    : ["Follow the detailed instructions on the main recipe page."];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 p-6 md:p-12 font-sans page-transition">
      <div className="mx-auto max-w-4xl bg-white dark:bg-stone-900 rounded-[32px] p-6 md:p-10 shadow-sm border border-stone-200 dark:border-stone-800">
        <div className="flex justify-between items-start mb-6">
          <Link href="/" className="text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline">← Back to Home</Link>
          <div className="flex gap-2">
            {/* Server-side refresh: simple link to reload the page and get a new random recipe */}
            <Link href="/recipe-of-the-day" className="text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline">
                ↻ New Random Recipe
            </Link>
            <QuickEditButton slug={featured.slug} />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold">{featured.title}</h1>
        <p className="text-sm uppercase tracking-wider text-amber-600 dark:text-amber-500 font-semibold mt-2">{featured.cuisine}</p>
        
        {featured.image && (
  <Image 
    // Use the utility to get the correct URL regardless of whether 'image' is a string or an object
    src={getImageUrl(featured.image, { width: 800, height: 400 })} 
    
    // Determine the alt text safely
    alt={
      typeof featured.image === 'object' && featured.image !== null && 'alt' in featured.image 
        ? (featured.image.alt || featured.title)
        : featured.title
    } 
    
    width={800} 
    height={400} 
    unoptimized
    
    // Combine the styles you wanted
    className="mt-6 w-full h-[300px] object-cover rounded-3xl"
  />
)}

        <p className="mt-6 text-lg text-stone-700 dark:text-stone-300 leading-relaxed">{featured.description}</p>
        
        <div className="mt-8">
            <h3 className="text-2xl font-semibold">Ingredients</h3>
            <ul className="mt-4 list-disc list-inside space-y-2 text-stone-750 dark:text-stone-300">
              {featured.ingredients?.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
        </div>

        <div className="mt-8">
            <h3 className="text-2xl font-semibold">Method</h3>
            <ol className="mt-4 list-decimal list-inside space-y-4 text-stone-750 dark:text-stone-300 leading-relaxed">
              {methodSteps.map((step, idx) => <li key={idx}>{step}</li>)}
            </ol>
        </div>
      </div>
    </main>
  );
}