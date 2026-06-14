import Link from 'next/link';
import { notFound } from 'next/navigation';
import { recipes } from '@/lib/recipes';
import ServingScaler from './ServingScaler';

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = recipes.find((item) => item.slug === params.slug);

  if (!recipe) notFound();

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

  const methodSteps = recipe.steps?.length
    ? recipe.steps
    : [
        `Prep all ingredients for ${recipe.title.toLowerCase()} and set your cookware out before you start.`,
        `Build the flavor base with the spice blend, aromatics, and any fresh vegetables or protein you are using.`,
        `Cook the main ingredient until fragrant and evenly colored, keeping the texture true to the dish style.`,
        `Add the starch or grains and fold in sauces, herbs, or finishing elements to bring the dish together.`,
        `Taste, adjust seasoning, and serve with the suggested accompaniments for the best texture and balance.`,
      ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">{recipe.cuisine}</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">{recipe.title}</h1>
          <p className="mt-4 text-stone-600">{recipe.description}</p>
          <img src={recipe.image} alt={recipe.title} className="mt-6 h-72 w-full rounded-3xl object-cover" />
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-stone-700">
            <span className="rounded-full bg-stone-100 px-3 py-1">Prep {recipe.prepTime}</span>
            <span className="rounded-full bg-stone-100 px-3 py-1">Cook {recipe.cookTime}</span>
            {recipe.totalTime ? <span className="rounded-full bg-stone-100 px-3 py-1">Total {recipe.totalTime}</span> : null}
            <span className="rounded-full bg-stone-100 px-3 py-1">Serves {recipe.servings}</span>
            <span className="rounded-full bg-stone-100 px-3 py-1">{recipe.difficulty}</span>
            {recipe.alcoholFree ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">Alcohol-free</span> : null}
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Recipe story</h2>
            <p className="mt-4 text-stone-600">{recipe.history}</p>
            <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
              <p><strong>Country:</strong> {recipe.country}</p>
              <p className="mt-2"><strong>Food type:</strong> {recipe.foodType}</p>
              <p className="mt-2"><strong>Meal type:</strong> {recipe.mealType}</p>
              <p className="mt-2"><strong>Nutrition:</strong> {recipe.calories}</p>
              <p className="mt-2"><strong>Rating:</strong> {recipe.rating}/5</p>
              {recipe.status ? <p className="mt-2"><strong>Status:</strong> {recipe.status}</p> : null}
            </div>
          </div>

          <ServingScaler recipeSlug={recipe.slug} originalServings={recipe.servings} ingredients={ingredientList} />

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Method</h2>
            <ol className="mt-4 space-y-3 text-sm text-stone-700">
              {methodSteps.map((step, index) => <li key={step} className="rounded-2xl bg-stone-50 px-3 py-3">{index + 1}. {step}</li>)}
            </ol>
          </div>

          {(recipe.foodSafetyNote || recipe.editorialNote || recipe.licenseNote) && (
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Catalog notes</h2>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                {recipe.foodSafetyNote ? <p>{recipe.foodSafetyNote}</p> : null}
                {recipe.editorialNote ? <p>{recipe.editorialNote}</p> : null}
                {recipe.licenseNote ? <p>{recipe.licenseNote}</p> : null}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Quick actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/recipe-of-the-day" className="rounded-full bg-amber-700 px-4 py-2 text-white">Try recipe of the day</Link>
              <Link href={`/ai?recipe=${recipe.slug}`} className="rounded-full border border-stone-300 px-4 py-2 text-stone-800">Modify with AI</Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
