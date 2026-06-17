'use client';

import { useEffect, useState } from 'react';

interface FavoriteButtonProps {
  slug: string;
  title: string;
  cuisine: string;
  image: string;
}

export default function FavoriteButton({ slug, title, cuisine, image }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some((f: any) => f.slug === slug));
  }, [slug]);

  const toggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      favorites = favorites.filter((f: any) => f.slug !== slug);
    } else {
      favorites.push({ slug, title, cuisine, image });
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
    
    // Notify other components (like the homepage bookmarked list) instantly
    window.dispatchEvent(new Event('favorites-updated'));
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleFavorite}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 ${
        isFavorite
          ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-500'
          : 'border-stone-200 bg-white text-stone-500 hover:border-rose-400 hover:text-rose-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300'
      }`}
    >
      <svg className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}