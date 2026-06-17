import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { loadPublicRecipes } from '@/lib/recipe-store'; // Direct server-side data loading
import { summarizeMethodStep } from '@/lib/method-summary';
import ServingScaler from './ServingScaler';
import QuickEditButton from '@/components/QuickEditButton';
import IngredientChecklist from '@/components/IngredientChecklist';
import FavoriteButton from '@/components/FavoriteButton';
import ImageWithSkeleton from '@/components/ImageWithSkeleton';

// Replace this:
// export const dynamic = 'force-dynamic';

// With this:
export const revalidate = 60; // The page will be cached for 60 seconds, making it instant for 99% of users.

interface PageProps {
  // Configured synchronously to prevent Next.js 14 build compilation failures
  params: { slug: string }; 
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const slug = params.slug;

  // Load the public recipes list directly on the server
  const publicRecipes = await loadPublicRecipes();
  const recipe = publicRecipes.find((item) => item.slug === slug);

  // Safe, server-side 404 redirect if the recipe is actually deleted
  if (!recipe) {
    notFound();
  }

  const ingredientList = recipe.ingredients?.length
    ? recipe.ingredients
    : [
        `${recipe.foodType || 'Signature'} base ingredient`,
        `${recipe.cuisine} spice blend`,
        'Fresh aromatics or herbs',
        'Seasonal vegetables or protein',
        'Cooked grains, noodles, or bread',
        'Finishing sauce, garnish, or acid',
      ];

  const baseMethodSteps = recipe.steps?.length
    ? recipe.steps.map((step) => summarizeMethodStep(step)).filter(Boolean)
    : [
        `Prep ingredients and set out your pan.`,
        `Cook aromatics, then add the main ingredient and spices.`,
        `Add sauce or stock and simmer gently.`,
        `Add grains or noodles if needed, then cook until tender.`,
        `Taste and finish with herbs or acid.`,
      ];

  const methodSteps = baseMethodSteps.map((step) => step.replace(/\.$/, ''));

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 font-sans page-transition">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:px-10">
        
        {/* Printable Area Wrapper */}
        <article id="print-area" className="space-y-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95 animate-fade-in">
          <div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              
              {/* Left Side: Cuisine/Country & Title */}
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-amber-700 dark:text-amber-500 font-semibold">{recipe.cuisine}</p>
                <h1 className="mt-3 text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">{recipe.title}</h1>
              </div>
              
              {/* Right Side: Stacks the favorite button on top right, other buttons below */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                {/* Top Right: Favorite heart button */}
                <FavoriteButton 
                  slug={recipe.slug} 
                  title={recipe.title} 
                  cuisine={recipe.cuisine} 
                  image={recipe.image} 
                />
                
                {/* Directly Below: Quick Edit & Modify with AI */}
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

          <div className="space-y-6">
            {recipe.image ? (
              <div className="h-[420px] w-full rounded-3xl overflow-hidden shadow-sm">
                <ImageWithSkeleton 
                  src={recipe.image} 
                  alt={recipe.title} 
                  width={1200} 
                  height={800} 
                  className="h-full w-full object-cover object-center" 
                />
              </div>
            ) : null}

            <div className="space-y-4 rounded-3xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-950/95 dark:text-stone-100">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-700 font-medium">Recipe details</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-stone-900 font-medium">Prep {recipe.prepTime}</span>
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-stone-900 font-medium">Cook {recipe.cookTime}</span>
                  {recipe.totalTime ? <span className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-stone-900 font-medium">Total {recipe.totalTime}</span> : null}
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-stone-900 font-medium">Serves {recipe.servings}</span>
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm dark:bg-stone-900 font-medium">{recipe.difficulty}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p><strong>Country:</strong> <span className="rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-xs text-stone-700 dark:text-stone-300 font-semibold">{recipe.country || recipe.cuisine || 'Global'}</span></p>
                <p><strong>Food type:</strong> {recipe.foodType}</p>
                <p><strong>Meal type:</strong> {recipe.mealType}</p>
                <p><strong>Calories:</strong> {recipe.calories}</p>
                {recipe.rating ? <p><strong>Rating:</strong> {recipe.rating}/5</p> : null}
              </div>

              {recipe.tags?.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-200 font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <IngredientChecklist recipeTitle={recipe.title} ingredients={ingredientList} />

          {(recipe.foodSafetyNote || recipe.editorialNote) && (
            <section className="rounded-3xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-950/95 dark:text-stone-100">
              <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Notes</h2>
              <div className="mt-4 space-y-4 leading-relaxed">
                <div className="space-y-3 text-sm text-stone-700 dark:text-stone-100">
                  <p>Use high-quality spices, fresh aromatics, and the correct cooking vessel for the best texture.</p>
                  <p>Let the dish rest briefly before serving to allow flavors to settle and liquids to absorb.</p>
                  <p>Adjust salt and acidity last so the final seasoning stays balanced.</p>
                </div>
                {recipe.foodSafetyNote ? <p>{recipe.foodSafetyNote}</p> : null}
                {recipe.editorialNote ? <p>{recipe.editorialNote}</p> : null}
              </div>
            </section>
          )}

        </article>

        <aside className="space-y-6 lg:flex lg:flex-col lg:gap-6 animate-fade-in">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Recipe story</h2>
              <p className="mt-4 text-stone-600 dark:text-stone-300 leading-relaxed">{recipe.history}</p>
            </div>
            
            

            <div className="mt-6">
              <ServingScaler recipeSlug={recipe.slug} originalServings={recipe.servings} ingredients={ingredientList} />
            </div>
          </div>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/95">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Method</h2>
            <ol className="mt-4 space-y-4 text-sm text-stone-700 dark:text-stone-100">
              {methodSteps.map((step, index) => (
                <li key={`${recipe.slug}-${index}`} className="rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 shadow-sm transition hover:border-amber-300 hover:bg-amber-50/60 dark:border-stone-800 dark:bg-stone-950/95 dark:hover:border-amber-700 dark:hover:bg-stone-900">
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