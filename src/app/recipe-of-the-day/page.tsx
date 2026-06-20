import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadPublicRecipes } from '@/lib/recipe-store';
import { summarizeMethodStep } from '@/lib/method-summary';
import { getImageUrl } from '@/lib/recipe-image';
import CuisineWithFlag from '@/components/CuisineWithFlag';
import QuickEditButton from '@/components/QuickEditButton';
import IngredientChecklist from '@/components/IngredientChecklist';
import FavoriteButton from '@/components/FavoriteButton';
import ImageWithSkeleton from '@/components/ImageWithSkeleton';
import GradientBackground from '@/components/GradientBackground';

// 1. Force the page to re-randomize every time, but render it on the server.
export const dynamic = 'force-dynamic';
export const revalidate = 0; 

interface PageProps {
  searchParams: Promise<{ recipe?: string }>;
}

export default async function RecipeOfTheDayPage({ searchParams }: PageProps) {
  const { recipe } = await searchParams;
  // 2. Fetch data directly on the server (No more loading spinners!)
  const recipes = await loadPublicRecipes();
  const publishedRecipes = recipes.filter(r => r.status === 'published');
  
  let featured = null;
  if (recipe) {
    featured = publishedRecipes.find(r => r.slug === recipe) || null;
  }
  if (!featured && publishedRecipes.length > 0) {
    featured = publishedRecipes[Math.floor(Math.random() * publishedRecipes.length)];
  }

  if (!featured) {
    return (
      <main className="min-h-screen bg-stone-50 p-10 text-center font-sans">
        <h1 className="text-2xl font-bold">No published recipes found.</h1>
        <p className="mt-2 text-stone-600">Please publish a recipe in the admin panel.</p>
        <Link href="/" className="mt-4 inline-block text-amber-700 underline">Back to home</Link>
      </main>
    );
  }

  const ingredientList = featured.ingredients?.length
    ? featured.ingredients
    : [`${featured.foodType || 'Signature'} base ingredient`, 'Fresh aromatics or herbs'];

  const methodSteps = (featured.steps && featured.steps.length > 0) 
    ? featured.steps.map((step) => summarizeMethodStep(step)) 
    : ["Follow the instructions on the recipe card."];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 font-sans page-transition">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 space-y-10">
        
        {/* Top Header with Back and Refresh buttons */}
        <div className="flex justify-between items-center bg-white/50 dark:bg-stone-900/50 backdrop-blur-md px-6 py-4 rounded-full border border-stone-200 dark:border-stone-800 shadow-sm animate-fade-in">
          <Link href="/" className="text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline">← Back to Home</Link>
          <div className="flex items-center gap-4">
            <a href="/recipe-of-the-day" className="text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline">
                ↻ New Random Recipe
            </a>
            <QuickEditButton slug={featured.slug} />
          </div>
        </div>

        {/* Hero: Title, Description, Actions and Image Side-by-Side */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 animate-fade-in">
          
          {/* Image Content */}
          {featured.image && (() => {
            const imageUrl = getImageUrl(featured.image, { width: 800, height: 600 });
            const altText = typeof featured.image === 'object' && featured.image !== null && 'alt' in featured.image ? featured.image.alt || featured.title : featured.title;
            const palette = featured.colorPalette;
            const gradientBg = palette?.gradientLight || 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)';
            
            return (
              <div className="flex-1 w-full max-w-2xl mx-auto lg:max-w-none">
                <GradientBackground
                  lightGradient={gradientBg}
                  className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl"
                >
                  <ImageWithSkeleton 
                    src={imageUrl}
                    alt={altText}
                    width={800}
                    height={600}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    wrapperClassName="bg-transparent h-full"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                </GradientBackground>
              </div>
            );
          })()}

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left w-full">
            <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Recipe of the Day</div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-700 dark:text-amber-500 font-semibold"><CuisineWithFlag cuisine={featured.cuisine} /></p>
            <h1 className="mt-4 text-4xl lg:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">{featured.title}</h1>
            <p className="mt-6 text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">{featured.description}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <FavoriteButton 
                slug={featured.slug} 
                title={featured.title} 
                cuisine={featured.cuisine} 
                image={getImageUrl(featured.image, { width: 640, height: 400 })} 
              />
              <Link
                href={`/ai?recipe=${featured.slug}`}
                className="inline-flex h-11 items-center justify-center rounded-full bg-amber-700 px-6 text-sm font-semibold text-white transition hover:bg-amber-600 shadow-sm"
              >
                ✨ Modify with AI
              </Link>
            </div>
          </div>
        </div>

        {/* Story Section */}
        {featured.history && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900/95">
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span className="text-amber-700">📖</span> The Story Behind This Recipe
              </h2>
              <p className="mt-5 text-stone-600 dark:text-stone-300 leading-relaxed text-lg">{featured.history}</p>
            </div>
          </div>
        )}

        {/* Bottom Section: Ingredients + Method side by side */}
        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95 h-[520px]">
            <IngredientChecklist 
              recipeTitle={featured.title} 
              ingredients={ingredientList} 
              originalServings={featured.servings}
              recipeSlug={featured.slug}
            />
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95 h-[520px] flex flex-col">
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 shrink-0 flex items-center gap-2">
              <span className="text-amber-700">👨‍🍳</span> Method
            </h2>
            <ol className="mt-5 flex-1 overflow-y-auto min-h-0 space-y-4 text-base text-stone-700 dark:text-stone-100 pr-1">
              {methodSteps.map((step, index) => (
                <li key={`${featured.slug}-${index}`}>
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-700 text-sm font-semibold text-white">{index + 1}</span>
                    <p className="leading-7">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>
    </main>
  );
}