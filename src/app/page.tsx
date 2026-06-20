import Link from 'next/link';
import { loadPublicRecipes } from '@/lib/recipe-store';
import { getImageUrl } from '@/lib/recipe-image';
import CuisineWithFlag from '@/components/CuisineWithFlag';
import AIChefForm from '@/components/AIChefForm';
import FavoritesList from '@/components/FavoritesList';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const recipes = await loadPublicRecipes();

  // 1. Calculations
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

  const featuredInAdmin = recipes.filter(r => r.featured === true);
  const recipeHighlights = featuredInAdmin.length > 0 
    ? featuredInAdmin.slice(0, 4) 
    : [...recipes].sort(() => 0.5 - Math.random()).slice(0, 4);

  const totalRecipes = recipes.length;
  const totalCuisines = cuisinesList.length;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900 transition-colors duration-200 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_45%,#111827_100%)] dark:text-stone-100 font-sans page-transition">
      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">        
        {/* Main Hero */}
        <article className="glass-card rounded-[32px] p-8 soft-ring dark:border-stone-800 dark:bg-stone-900/95">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700 font-medium">Discover the world, one recipe at a time</p>
          <h1 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 lg:text-6xl">CULINARRIEST</h1>
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

        {/* Sidebar - Cook with what you have (AI Chef) */}
        <div className="w-full rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <AIChefForm />
        </div>
      </section>

      <FavoritesList />

      {/* Featured Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-8 lg:px-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {featuredInAdmin.length > 0 ? "Featured Recipes" : "Fresh Picks"}
          </h2>
          <Link href="/recipes" className="text-sm font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-500">View all →</Link>
        </div>

       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 w-full">
        {recipeHighlights.map((recipe) => (
          <div key={recipe.slug} className="min-w-0">
            <Link key={recipe.slug} href={`/recipes/${recipe.slug}`} className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-stone-200 bg-white p-5 shadow-[0_15px_40px_rgba(28,25,23,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(28,25,23,0.08)] dark:border-stone-850 dark:bg-stone-900/95">
              <div>
                <div className="relative overflow-hidden rounded-2xl h-40 w-full bg-stone-100 dark:bg-stone-800">
                  {recipe.image && (
                    <Image 
                      src={getImageUrl(recipe.image, { width: 640, height: 400 })} 
                      alt={typeof recipe.image === 'object' && recipe.image !== null && 'alt' in recipe.image ? recipe.image.alt || recipe.title : recipe.title} 
                      width={640} height={400} 
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 320px"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-amber-100/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-950 shadow-sm border border-amber-200/40">
                      <CuisineWithFlag cuisine={recipe.cuisine} />
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold font-serif text-stone-900 group-hover:text-amber-700 transition-colors dark:text-stone-100 line-clamp-1">{recipe.title}</h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">{recipe.description}</p>
              </div>
              <div className="mt-4 border-t border-stone-100 pt-3 flex items-center justify-between text-xs text-stone-500 dark:border-stone-800">
                <span className="font-medium bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">{recipe.difficulty}</span>
                <span className="font-semibold text-amber-700 dark:text-amber-500 group-hover:underline">Read more →</span>
              </div>
            </Link>
          </div>
          ))}
          </div>
      </section>

      {/* Cuisines & Recipe of the Day Section */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-8 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <article className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900 flex flex-col">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-700 dark:text-amber-500 font-bold">Inspiration</span>
            <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">Popular cuisines</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 flex-grow">
            {popularCuisines.map((item) => (
              <Link key={item.name} href={`/recipes?cuisine=${encodeURIComponent(item.name)}`} className="group flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/50 p-4 transition hover:border-amber-200 dark:border-stone-800 dark:bg-stone-950/40">
                <span className="font-semibold text-stone-850 dark:text-stone-200 group-hover:text-amber-700 dark:group-hover:text-amber-500">
                  <CuisineWithFlag cuisine={item.name} />
                </span>
                <span className="rounded-full bg-white dark:bg-stone-900 px-2.5 py-1 text-xs font-bold text-stone-500 shadow-sm border border-stone-100">{item.count}</span>
              </Link>
            ))}
          </div>
        </article>
        {/* Recipe of the Day - moved here */}
        <article className="rounded-[32px] border border-stone-800 bg-stone-950 p-8 text-stone-100 shadow-[0_24px_60px_rgba(15,23,42,0.35)] flex flex-col justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300 font-medium">Recipe of the Day</p>
            {featured ? (
              <>
                <h2 className="mt-3 text-2xl font-semibold">{featured.title}</h2>
                <p className="mt-3 text-stone-300">{featured.description}</p>
                <div className="mt-5 w-full rounded-3xl overflow-hidden bg-stone-800 aspect-[4/3]">
                  <Image 
                    src={getImageUrl(featured.image, { width: 800, height: 600 })} 
                    alt={typeof featured.image === 'object' && featured.image !== null && 'alt' in featured.image ? featured.image.alt || featured.title : featured.title} 
                    width={800} height={600} 
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                    className="h-full w-full object-cover" 
                  />
                </div>
                <Link href={`/recipe-of-the-day?recipe=${featured.slug}`} className="mt-5 inline-block text-center rounded-full bg-amber-500 px-4 py-3 text-stone-950 font-bold transition hover:-translate-y-0.5 hover:bg-amber-400">View full recipe</Link>
              </>
            ) : (
              <p className="mt-4 text-stone-300">Recipe data is currently unavailable.</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}