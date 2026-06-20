import Link from 'next/link';
import { loadPublicRecipes } from '@/lib/recipe-store'; // Direct server-side data loading
import CuisineWithFlag from '@/components/CuisineWithFlag';

export const dynamic = 'force-dynamic';

export default async function CuisinesPage() {
  // Load public recipes instantly from the file system on the server
  const recipes = await loadPublicRecipes();

  // Extract unique active cuisines dynamically from the database
  const uniqueCuisines = Array.from(new Set(recipes.map((r) => r.cuisine).filter(Boolean)));

  // Calculate counts and samples dynamically on the server
  const cuisineGroups = uniqueCuisines
    .map((cuisine) => {
      const matchingRecipes = recipes.filter((recipe) => recipe.cuisine === cuisine);
      return {
        name: cuisine,
        count: matchingRecipes.length,
        samples: matchingRecipes.slice(0, 3), // Shows up to 3 sample recipe links
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 font-sans page-transition">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 space-y-8 animate-fade-in">
        
        {/* Main Cuisines Card */}
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-850 dark:bg-stone-900/95">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700 dark:text-amber-500 font-semibold">Cuisines</p>
          <h1 className="mt-3 text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 lg:text-5xl">Browse the global culinary map.</h1>
          
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cuisineGroups.map((item) => (
              <Link 
                key={item.name} 
                href={`/recipes?cuisine=${encodeURIComponent(item.name)}`} 
                className="group rounded-3xl border border-stone-200 bg-stone-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:bg-white hover:shadow-md dark:border-stone-800 dark:bg-stone-950/40 dark:hover:border-stone-700 dark:hover:bg-stone-900"
              >
                <p className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors flex items-center gap-2">
                  <CuisineWithFlag cuisine={item.name} />
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-amber-700 dark:text-amber-500 font-semibold">{item.count} recipes</p>
                
                <ul className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
                  {item.samples.map((recipe) => (
                    <li key={recipe.slug} className="truncate group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
                      • {recipe.title}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
            
            {cuisineGroups.length === 0 ? (
              <p className="text-sm text-stone-500 col-span-full">No active cuisines found inside your database.</p>
            ) : null}
          </div>
        </article>

        {/* Categories summary banner */}
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-850 dark:bg-stone-900/95">
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">Live recipe categories</h2>
          <ul className="mt-4 grid gap-3 text-stone-700 dark:text-stone-300 md:grid-cols-2">
            {cuisineGroups.map((group) => (
              <li key={group.name} className="flex items-center gap-2">
                <span className="text-amber-700 dark:text-amber-500 font-bold">•</span>
                <span className="flex items-center gap-2"><strong><CuisineWithFlag cuisine={group.name} /></strong> — {group.count} recipes currently active in your digital library</span>
              </li>
            ))}
          </ul>
        </article>

      </section>
    </main>
  );
}