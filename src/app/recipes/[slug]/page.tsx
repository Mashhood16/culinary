import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadPublicRecipes } from '@/lib/recipe-store';
import { summarizeMethodStep } from '@/lib/method-summary';
import { getImageUrl } from '@/lib/recipe-image';
import QuickEditButton from '@/components/QuickEditButton';
import IngredientChecklist from '@/components/IngredientChecklist';
import FavoriteButton from '@/components/FavoriteButton';
import ImageWithSkeleton from '@/components/ImageWithSkeleton';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Data Loading (Server-side)
  const publicRecipes = await loadPublicRecipes();
  const recipe = publicRecipes.find((item) => item.slug === slug);

  if (!recipe) {
    notFound();
  }

  // 2. Logic Preparation
  const ingredientList = recipe.ingredients?.length
    ? recipe.ingredients
    : [`${recipe.foodType || 'Signature'} base ingredient`, 'Fresh aromatics or herbs'];

  const methodSteps = (recipe.steps && recipe.steps.length > 0) 
    ? recipe.steps.map((step) => summarizeMethodStep(step)) 
    : ["Follow the instructions on the recipe card."];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 font-sans page-transition">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 space-y-10">
        
        {/* Hero: Title, Description, Actions */}
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700 dark:text-amber-500 font-semibold">{recipe.cuisine}</p>
          <h1 className="mt-4 text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">{recipe.title}</h1>
          <p className="mt-6 text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto">{recipe.description}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <FavoriteButton 
              slug={recipe.slug} 
              title={recipe.title} 
              cuisine={recipe.cuisine} 
              image={getImageUrl(recipe.image, { width: 640, height: 400 })} 
            />
            <QuickEditButton slug={recipe.slug} />
            <Link
              href={`/ai?recipe=${recipe.slug}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-amber-700 px-6 text-sm font-semibold text-white transition hover:bg-amber-600 shadow-sm"
            >
              ✨ Modify with AI
            </Link>
          </div>
        </div>

        {/* Image with blurred color background */}
        {recipe.image && (() => {
          const imageUrl = getImageUrl(recipe.image, { width: 1400, height: 900 });
          const altText = typeof recipe.image === 'object' && recipe.image !== null && 'alt' in recipe.image ? recipe.image.alt || recipe.title : recipe.title;
          return (
            <div className="relative w-full rounded-3xl overflow-hidden shadow-md animate-fade-in">
              {/* Blurred background layer - creates the color gradient effect */}
              <img
                src={imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-150 blur-2xl opacity-60 dark:opacity-30"
              />
              {/* Main image */}
              <ImageWithSkeleton 
                src={imageUrl}
                alt={altText}
                width={1400}
                height={900}
                sizes="100vw"
                wrapperClassName="bg-transparent"
                className="relative w-full h-auto max-h-[520px] object-contain" 
              />
            </div>
          );
        })()}

        {/* Story Section */}
        {recipe.history && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900/95">
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span className="text-amber-700">📖</span> The Story Behind This Recipe
              </h2>
              <p className="mt-5 text-stone-600 dark:text-stone-300 leading-relaxed text-lg">{recipe.history}</p>
            </div>
          </div>
        )}

        {/* Bottom Section: Ingredients + Method side by side */}
        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95 h-[520px]">
            <IngredientChecklist 
              recipeTitle={recipe.title} 
              ingredients={ingredientList} 
              originalServings={recipe.servings}
              recipeSlug={recipe.slug}
            />
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95 h-[520px] flex flex-col">
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 shrink-0 flex items-center gap-2">
              <span className="text-amber-700">👨‍🍳</span> Method
            </h2>
            <ol className="mt-5 flex-1 overflow-y-auto min-h-0 space-y-4 text-base text-stone-700 dark:text-stone-100 pr-1">
              {methodSteps.map((step, index) => (
                <li key={`${recipe.slug}-${index}`}>
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