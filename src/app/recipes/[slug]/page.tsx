import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadPublicRecipes } from '@/lib/recipe-store';
import { summarizeMethodStep } from '@/lib/method-summary';
import { getImageUrl } from '@/lib/recipe-image';
import ServingScaler from './ServingScaler';
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
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:px-10">
        
        {/* Main Content */}
        <article id="print-area" className="space-y-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95 animate-fade-in">
          <div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-amber-700 dark:text-amber-500 font-semibold">{recipe.cuisine}</p>
                <h1 className="mt-3 text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">{recipe.title}</h1>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <FavoriteButton 
                  slug={recipe.slug} 
                  title={recipe.title} 
                  cuisine={recipe.cuisine} 
                  image={getImageUrl(recipe.image, { width: 640, height: 400 })} 
                />
                
                <div className="flex flex-wrap items-center gap-2">
                  <QuickEditButton slug={recipe.slug} />
                  <Link
                    href={`/ai?recipe=${recipe.slug}`}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-amber-700 px-5 text-sm font-semibold text-white transition hover:bg-amber-600 shadow-sm"
                  >
                    Modify with AI
                  </Link>
                </div>
              </div>
            </div>
            <p className="mt-4 text-stone-600 dark:text-stone-300 leading-relaxed">{recipe.description}</p>
          </div>

          {/* Image */}
          {recipe.image && (
            <div className="h-[420px] w-full rounded-3xl overflow-hidden shadow-sm">
              <ImageWithSkeleton 
                src={getImageUrl(recipe.image, { width: 1200, height: 800 })}
                alt={typeof recipe.image === 'object' && recipe.image !== null && 'alt' in recipe.image ? recipe.image.alt || recipe.title : recipe.title}
                width={1200}
                height={800}
                className="h-full w-full object-cover object-center" 
              />
            </div>
          )}

          <IngredientChecklist recipeTitle={recipe.title} ingredients={ingredientList} />
        </article>

        {/* Sidebar */}
        <aside className="space-y-6 lg:flex lg:flex-col lg:gap-6 animate-fade-in">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Recipe story</h2>
            <p className="mt-4 text-stone-600 dark:text-stone-300 leading-relaxed">{recipe.history}</p>
            <div className="mt-6">
              <ServingScaler recipeSlug={recipe.slug} originalServings={recipe.servings} ingredients={ingredientList} />
            </div>
          </div>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Method</h2>
            <ol className="mt-4 space-y-4 text-sm text-stone-700 dark:text-stone-100">
              {methodSteps.map((step, index) => (
                <li key={`${recipe.slug}-${index}`} className="rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 shadow-sm transition hover:border-amber-300 hover:bg-amber-50/60 dark:border-stone-800 dark:bg-stone-950/95">
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