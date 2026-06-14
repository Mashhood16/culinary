import Link from 'next/link';
import { recipes } from '@/lib/recipes';

export default function DessertsPage() {
  const desserts = recipes.filter((recipe) => recipe.mealType === 'Dessert' || recipe.foodType === 'Dessert');
  const cuisines = Array.from(new Set(desserts.map((recipe) => recipe.cuisine))).sort();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Desserts</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">Sweet endings from around the world.</h1>
          <p className="mt-4 text-stone-600">Explore {desserts.length} dessert recipes across {cuisines.length} cuisines, all imported from the alcohol-free catalog.</p>
        </article>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {desserts.map((recipe) => (
            <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <img src={recipe.image} alt={recipe.title} className="h-44 w-full object-cover" />
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-700">{recipe.cuisine}</p>
                <h2 className="mt-2 text-xl font-semibold">{recipe.title}</h2>
                <p className="mt-2 text-sm text-stone-600">{recipe.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-700">
                  <span className="rounded-full bg-stone-100 px-2.5 py-1">{recipe.totalTime ?? recipe.prepTime}</span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1">{recipe.difficulty}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
