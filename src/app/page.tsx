import Link from 'next/link';
import Image from 'next/image';
import { loadPublicRecipes } from '@/lib/recipe-store';
import AIChefForm from '@/components/AIChefForm';
import FavoritesList from '@/components/FavoritesList';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const recipes = loadPublicRecipes();
  
  const featured = recipes.length > 0 
    ? recipes[Math.floor(Math.random() * recipes.length)] || recipes[0]
    : null;

  const cuisinesList = Array.from(new Set(recipes.map((r) => r.cuisine).filter(Boolean)));

  const popularCuisines = cuisinesList
    .map((cuisine) => ({
      name: cuisine,
      count: recipes.filter((recipe) => recipe.cuisine === cuisine).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const recipeHighlights = recipes.slice(0, 4);
  const totalRecipes = recipes.length;
  const totalCuisines = cuisinesList.length;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 transition-colors duration-200 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 font-sans page-transition">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <article className="glass-card rounded-[32px] p-8 soft-ring dark:border-stone-800 dark:bg-stone-900/95">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700 font-medium">Discover the world, one recipe at a time</p>
          <h1 className="mt-4 text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 lg:text-6xl">Culnarriest</h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-300">Explore global recipes with a premium, safe recipe approach and AI-assisted food science guidance.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/recipes" className="rounded-full bg-amber-700 px-5 py-3 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-800 font-medium">Explore recipes</Link>
            <Link href="/ai" className="rounded-full border border-stone-300 bg-white/80 px-5 py-3 text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100 font-medium">Ask the AI chef</Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950/80">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500 font-medium">Recipes</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">{totalRecipes}</p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950/80">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500 font-medium">Cuisines</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-100">{totalCuisines}</p>
            </div>
          </div>
        </article>

        <aside className="rounded-[32px] border border-stone-800 bg-stone-950 p-8 text-stone-100 shadow-[0_24px_60px_rgba(15,23,42,0.35)] flex flex-col justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300 font-medium">Recipe of the Day</p>
            {featured ? (
              <>
                <h2 className="mt-3 text-2xl font-semibold">{featured.title}</h2>
                <p className="mt-3 text-stone-300">{featured.description}</p>
                {featured.image ? (
                  <Image src={featured.image} alt={featured.title} width={800} height={480} className="mt-5 h-48 w-full rounded-3xl object-cover" />
                ) : null}
                <Link href={`/recipe-of-the-day?recipe=${featured.slug}`} className="mt-5 inline-block rounded-full bg-amber-500 px-4 py-2 text-stone-950 font-medium transition hover:-translate-y-0.5 hover:bg-amber-400">View full recipe</Link>
              </>
            ) : (
              <p className="mt-4 text-stone-300">Recipe data is currently unavailable. Add recipes in the admin panel to restore homepage highlights.</p>
            )}
          </div>
        </aside>
      </section>

      <FavoritesList />

      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {recipeHighlights.map((recipe) => (
            <Link 
              key={recipe.slug} 
              href={`/recipes/${recipe.slug}`} 
              className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-stone-200 bg-white p-5 shadow-[0_15px_40px_rgba(28,25,23,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(28,25,23,0.08)] dark:border-stone-850 dark:bg-stone-900/95"
            >
              <div>
                <div className="relative overflow-hidden rounded-2xl">
                  {recipe.image ? (
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="h-40 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                    />
                  ) : null}
                  
                  {/* High contrast, conflict-free floating tag */}
                  <span className="absolute left-3 top-3 rounded-full bg-amber-100/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-950 shadow-sm border border-amber-200/40">
                    {recipe.cuisine}
                  </span>
                </div>
                
                <h3 className="mt-4 text-xl font-bold font-serif text-stone-900 group-hover:text-amber-700 transition-colors dark:text-stone-100 dark:group-hover:text-amber-500">
                  {recipe.title}
                </h3>
                
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              <div className="mt-4 border-t border-stone-100 pt-3 flex items-center justify-between text-xs text-stone-500 dark:border-stone-800">
                <span>{recipe.difficulty}</span>
                <span className="font-semibold text-amber-700 dark:text-amber-500 group-hover:underline flex items-center gap-1">
                  View recipe 
                  <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-10 lg:grid-cols-[1fr_1fr] lg:px-10">
        
        {/* Redesigned Popular Cuisines Bento-style Card */}
        <article className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-700 dark:text-amber-500 font-bold">Inspiration</span>
            <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">Popular cuisines</h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Explore traditional home-kitchen formulations grouped by cultural origin.</p>
            
            {/* Visual 2-column grid of rich hover cards */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {popularCuisines.map((item) => (
                <Link
                  key={item.name}
                  href={`/recipes?cuisine=${encodeURIComponent(item.name)}`}
                  className="group flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/50 p-4 transition-all duration-300 hover:border-amber-200 hover:bg-amber-50/20 dark:border-stone-800 dark:bg-stone-950/40 dark:hover:border-stone-700 dark:hover:bg-stone-900/60"
                >
                  <div className="flex items-center gap-2">
                    {/* Dynamic Globe Icon */}
                    <svg className="h-4 w-4 text-amber-700 dark:text-amber-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a1.5 1.5 0 001.5-1.5V9a2 2 0 00-2-2h-1.414a1 1 0 00-.707-.293L12 6.5" />
                    </svg>
                    <span className="font-semibold text-stone-850 dark:text-stone-200 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <span className="rounded-full bg-white dark:bg-stone-900 px-2.5 py-1 text-xs font-bold text-stone-500 dark:text-stone-400 shadow-sm border border-stone-100 dark:border-stone-800 group-hover:border-amber-100 dark:group-hover:border-stone-700">
                    {item.count}
                  </span>
                </Link>
              ))}
              {popularCuisines.length === 0 ? (
                <p className="text-sm text-stone-500 col-span-2">No active cuisines found.</p>
              ) : null}
            </div>
          </div>

          {/* Dynamic Informational Footer to Balance Height */}
          <div className="mt-8 border-t border-stone-100 dark:border-stone-800 pt-5 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
            <div className="rounded-full bg-amber-50 dark:bg-stone-950 p-2.5 shrink-0">
              <svg className="h-5 w-5 text-amber-700 dark:text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="leading-relaxed">
              Cuisines are calculated in real-time from active catalog recipes. Add more formulations inside the administrator panel to dynamically expand list parameters.
            </p>
          </div>
        </article>
        
        <AIChefForm />
      </section>
    </main>
  );
}