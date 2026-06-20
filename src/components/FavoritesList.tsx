'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { getImageUrl } from '@/lib/recipe-image'; 
import CuisineWithFlag from '@/components/CuisineWithFlag';

export default function FavoritesList() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadFavorites = () => {
    const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(saved);
  };

  useEffect(() => {
    setMounted(true);
    loadFavorites();

    window.addEventListener('favorites-updated', loadFavorites);
    return () => window.removeEventListener('favorites-updated', loadFavorites);
  }, []);

  if (!mounted || favorites.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10 page-transition">
      <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">Your bookmarked favorites</h2>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {favorites.map((recipe) => (
          <Link 
            key={recipe.slug} 
            href={`/recipes/${recipe.slug}`} 
            className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-stone-200 bg-white p-5 shadow-[0_15px_40px_rgba(28,25,23,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(28,25,23,0.08)] dark:border-stone-850 dark:bg-stone-900/95"
          >
            <div>
              <div className="relative overflow-hidden rounded-2xl h-40 w-full bg-stone-100 dark:bg-stone-800">
                {recipe.image ? (
                  <Image 
                    src={getImageUrl(recipe.image, { width: 640, height: 400 })}
                    alt={typeof recipe.image === 'object' && recipe.image !== null && 'alt' in recipe.image ? recipe.image.alt || recipe.title : recipe.title}
                    width={640}
                    height={400}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 320px"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-400 text-xs">No Image</div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm border border-white/10">
                  <CuisineWithFlag cuisine={recipe.cuisine} />
                </span>
              </div>
              
              <h3 className="mt-4 text-xl font-bold font-serif text-stone-900 group-hover:text-amber-700 transition-colors dark:text-stone-100 dark:group-hover:text-amber-500">
                {recipe.title}
              </h3>
            </div>
            
            <div className="mt-4 border-t border-stone-100 pt-3 flex items-center justify-end text-xs text-stone-500 dark:border-stone-800">
              <span className="font-semibold text-amber-700 dark:text-amber-500 group-hover:underline flex items-center gap-1">
                Cook now 
                <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}