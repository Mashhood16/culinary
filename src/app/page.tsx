import Link from 'next/link';
<<<<<<< HEAD
import { loadPublicRecipes } from '@/lib/recipe-store';
import AIChefForm from '@/components/AIChefForm';
import FavoritesList from '@/components/FavoritesList';
import ImageWithSkeleton from '@/components/ImageWithSkeleton';
=======
import Image from 'next/image';
import { loadPublicRecipes } from '@/lib/recipe-store';
import { getImageUrl } from '@/lib/recipe-image';
import AIChefForm from '@/components/AIChefForm';
import FavoritesList from '@/components/FavoritesList';
>>>>>>> origin/main

export const dynamic = 'force-dynamic';

export default async function Home() {
  const recipes = await loadPublicRecipes();
  
<<<<<<< HEAD
  // Pick one random featured recipe for the sidebar
=======
>>>>>>> origin/main
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

<<<<<<< HEAD
  // Logic: Prioritize recipes marked 'featured' in Admin Panel, fallback to random 4
=======
>>>>>>> origin/main
  const featuredInAdmin = recipes.filter(r => r.featured === true);
  const recipeHighlights = featuredInAdmin.length > 0 
    ? featuredInAdmin.slice(0, 4) 
    : [...recipes].sort(() => 0.5 - Math.random()).slice(0, 4);

  const totalRecipes = recipes.length;
  const totalCuisines = cuisinesList.length;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 transition-colors duration-200 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 font-sans page-transition">
<<<<<<< HEAD
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        
        {/* Main Hero Section */}
=======
      <section className="mx-auto grid max-w-[1440px] gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        
>>>>>>> origin/main
        <article className="glass-card rounded-[32px] p-8 soft-ring dark:border-stone-800 dark:bg-stone-900/95">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700 font-medium">Discover the world, one recipe at a time</p>
          <h1 className="mt-4 text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 lg:text-6xl">Culinarriest</h1>
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

<<<<<<< HEAD
        {/* Recipe of the Day Sidebar */}
=======
>>>>>>> origin/main
        <aside className="rounded-[32px] border border-stone-800 bg-stone-950 p-8 text-stone-100 shadow-[0_24px_60px_rgba(15,23,42,0.35)] flex flex-col justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300 font-medium">Recipe of the Day</p>
            {featured ? (
              <>
                <h2 className="mt-3 text-2xl font-semibold">{featured.title}</h2>
                <p className="mt-3 text-stone-300">{featured.description}</p>
                {featured.image ? (
<<<<<<< HEAD
                  <div className="mt-5 h-48 w-full rounded-3xl overflow-hidden">
                    <ImageWithSkeleton src={featured.image} alt={featured.title} width={800} height={480} className="h-full w-full object-cover" />
=======
                  <div className="mt-5 h-48 w-full rounded-3xl overflow-hidden bg-stone-800">
                    <Image 
                      src={getImageUrl(featured.image, { width: 800, height: 480 })} 
                      alt={typeof featured.image === 'object' && featured.image !== null ? featured.image.alt : featured.title} 
                      width={800} 
                      height={480} 
                      className="h-full w-full object-cover" 
                      unoptimized 
                    />
>>>>>>> origin/main
                  </div>
                ) : null}
                <Link href={`/recipe-of-the-day?recipe=${featured.slug}`} className="mt-5 inline-block rounded-full bg-amber-500 px-4 py-2 text-stone-950 font-medium transition hover:-translate-y-0.5 hover:bg-amber-400">View full recipe</Link>
              </>
            ) : (
              <p className="mt-4 text-stone-300">Recipe data is currently unavailable.</p>
            )}
          </div>
        </aside>
      </section>

      <FavoritesList />

<<<<<<< HEAD
      {/* Featured Recipe Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
=======
      <section className="mx-auto max-w-[1440px] px-6 pb-8 lg:px-10">
>>>>>>> origin/main
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {featuredInAdmin.length > 0 ? "Featured Recipes" : "Fresh Picks"}
          </h2>
          <Link href="/recipes" className="text-sm font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-500">
            View all →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {recipeHighlights.map((recipe) => (
            <Link 
              key={recipe.slug} 
              href={`/recipes/${recipe.slug}`} 
              className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-stone-200 bg-white p-5 shadow-[0_15px_40px_rgba(28,25,23,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(28,25,23,0.08)] dark:border-stone-850 dark:bg-stone-900/95"
            >
              <div>
<<<<<<< HEAD
                <div className="relative overflow-hidden rounded-2xl h-40 w-full">
                  {recipe.image ? (
                    <ImageWithSkeleton 
                      src={recipe.image} 
                      alt={recipe.title} 
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                    />
                  ) : (
                    <div className="h-full w-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 text-xs">No Image</div>
=======
                <div className="relative overflow-hidden rounded-2xl h-40 w-full bg-stone-100 dark:bg-stone-800">
                  {recipe.image ? (
                    <Image 
                      src={getImageUrl(recipe.image, { width: 640, height: 400 })} 
                      alt={typeof recipe.image === 'object' && recipe.image !== null ? recipe.image.alt : recipe.title} 
                      width={640} 
                      height={400} 
                      sizes="(max-width: 768px) 100vw, 320px"
                      unoptimized
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone-400">No Image</div>
>>>>>>> origin/main
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-amber-100/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-950 shadow-sm border border-amber-200/40">
                    {recipe.cuisine}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold font-serif text-stone-900 group-hover:text-amber-700 transition-colors dark:text-stone-100 dark:group-hover:text-amber-500 line-clamp-1">
                  {recipe.title}
                </h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              <div className="mt-4 border-t border-stone-100 pt-3 flex items-center justify-between text-xs text-stone-500 dark:border-stone-800">
                <span className="font-medium bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">{recipe.difficulty}</span>
                <span className="font-semibold text-amber-700 dark:text-amber-500 group-hover:underline flex items-center gap-1">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

<<<<<<< HEAD
      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-10 lg:grid-cols-[1fr_1fr] lg:px-10">
=======
      <section className="mx-auto grid max-w-[1440px] gap-6 px-6 pb-10 lg:grid-cols-[1fr_1fr] lg:px-10">
>>>>>>> origin/main
        <article className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-700 dark:text-amber-500 font-bold">Inspiration</span>
            <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">Popular cuisines</h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Explore traditional home-kitchen formulations grouped by cultural origin.</p>
            
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {popularCuisines.map((item) => (
                <Link
                  key={item.name}
                  href={`/recipes?cuisine=${encodeURIComponent(item.name)}`}
                  className="group flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/50 p-4 transition-all duration-300 hover:border-amber-200 hover:bg-amber-50/20 dark:border-stone-800 dark:bg-stone-950/40 dark:hover:border-stone-700 dark:hover:bg-stone-900/60"
                >
                  <div className="flex items-center gap-2">
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
            </div>
          </div>
          <div className="mt-8 border-t border-stone-100 dark:border-stone-800 pt-5 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
            <div className="rounded-full bg-amber-50 dark:bg-stone-950 p-2.5 shrink-0">
              <svg className="h-5 w-5 text-amber-700 dark:text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="leading-relaxed">Cuisines are calculated in real-time from active catalog recipes.</p>
          </div>
        </article>
        
        <AIChefForm />
      </section>
    </main>
  );
}