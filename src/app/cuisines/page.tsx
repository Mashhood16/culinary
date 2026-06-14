import Link from 'next/link';
import { cuisines, recipes } from '@/lib/recipes';

export default function CuisinesPage() {
  const cuisineGroups = cuisines
    .map((cuisine) => ({
      name: cuisine,
      count: recipes.filter((recipe) => recipe.cuisine === cuisine).length,
      samples: recipes.filter((recipe) => recipe.cuisine === cuisine).slice(0, 3),
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Cuisines</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">Browse the global culinary map.</h1>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cuisineGroups.map((item) => (
              <Link key={item.name} href={`/recipes?cuisine=${encodeURIComponent(item.name)}`} className="rounded-3xl border border-stone-200 bg-stone-50 p-5 transition hover:-translate-y-1 hover:border-amber-300 hover:bg-white hover:shadow-md">
                <p className="text-sm font-semibold text-stone-900">{item.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-amber-700">{item.count} recipes</p>
                <ul className="mt-3 space-y-1 text-sm text-stone-600">
                  {item.samples.map((recipe) => <li key={recipe.slug}>• {recipe.title}</li>)}
                </ul>
              </Link>
            ))}
          </div>
        </article>
        <article className="mt-6 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Live recipe categories</h2>
          <ul className="mt-4 grid gap-3 text-stone-700 md:grid-cols-2">
            {cuisineGroups.map((group) => <li key={group.name}>• {group.name} — {group.count} recipes currently in the library</li>)}
          </ul>
        </article>
      </section>
    </main>
  );
}
