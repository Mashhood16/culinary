'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';
import { themeConfig } from '@/config/themeConfig';

const navItems = [
  { href: '/recipe-of-the-day', label: 'Recipe of the Day' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/cuisines', label: 'Cuisines' },
  { href: '/ai', label: 'AI Food Scientist' },
  { href: '/about', label: 'About' },
  { href: '/help', label: 'Help' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isFocused && recipes.length === 0) {
      fetch('/api/recipes')
        .then(res => res.json())
        .then(data => setRecipes(data))
        .catch(err => console.error("Failed to fetch recipes", err));
    }
  }, [isFocused, recipes.length]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const query = searchQuery.toLowerCase();
      const filtered = recipes.filter(r => 
        r.title.toLowerCase().includes(query) || 
        (r.cuisine && r.cuisine.toLowerCase().includes(query))
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, recipes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recipes?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
      setSearchQuery('');
      setIsFocused(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/60 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-stone-800 dark:bg-stone-950/80">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          href="/"
          className="shrink-0 flex items-center font-serif text-2xl font-bold tracking-tight text-brand-primary"
          onClick={() => setIsOpen(false)}
        >
          {themeConfig.logoUrl ? (
            <Image src={themeConfig.logoUrl} alt={themeConfig.brandName} width={220} height={88} className="h-[48px] md:h-[56px] lg:h-[64px] w-auto object-contain" />
          ) : (
            themeConfig.brandName
          )}
        </Link>

        <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-200">
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 transition ${
                    isActive 
                      ? 'bg-amber-100 text-amber-800 font-bold dark:bg-amber-900/30 dark:text-amber-300' 
                      : 'hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-stone-900 dark:hover:text-amber-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <form onSubmit={handleSearch} className="hidden lg:flex relative ml-2 items-center">
            <input 
              type="text" 
              placeholder="Search recipes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="w-48 rounded-full border border-stone-200 bg-stone-50 py-1.5 pl-9 pr-4 text-sm outline-none transition focus:border-brand-primary focus:bg-white dark:border-stone-700 dark:bg-stone-900 dark:focus:border-brand-primary"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {/* Suggestions Dropdown */}
            {isFocused && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-stone-900 rounded-2xl shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 overflow-hidden z-50">
                {suggestions.map(recipe => (
                  <Link 
                    key={recipe.slug} 
                    href={`/recipes/${recipe.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-b border-stone-50 dark:border-stone-800 last:border-0"
                    onClick={() => {
                      setSearchQuery('');
                      setIsFocused(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{recipe.title}</p>
                      <p className="text-xs text-brand-primary dark:text-brand-accent uppercase tracking-wider mt-0.5 font-bold">{recipe.cuisine}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 transition hover:border-amber-300 hover:bg-amber-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 lg:hidden"
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>

        {isOpen ? (
          <div className="absolute inset-x-6 top-full z-30 mt-3 rounded-3xl border border-stone-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-stone-700 dark:bg-stone-950/95 lg:hidden">
            <div className="flex flex-col gap-3 text-base text-stone-800 dark:text-stone-100">
              <form onSubmit={handleSearch} className="relative mb-2">
                <input 
                  type="text" 
                  placeholder="Search recipes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-primary dark:border-stone-700 dark:bg-stone-900"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {isFocused && suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-stone-900 rounded-2xl shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 overflow-hidden z-50">
                    {suggestions.map(recipe => (
                      <Link 
                        key={recipe.slug} 
                        href={`/recipes/${recipe.slug}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-b border-stone-50 dark:border-stone-800 last:border-0"
                        onClick={() => {
                          setSearchQuery('');
                          setIsFocused(false);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{recipe.title}</p>
                          <p className="text-xs text-brand-primary dark:text-brand-accent uppercase tracking-wider mt-0.5 font-bold">{recipe.cuisine}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </form>
              
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-2xl px-4 py-3 transition ${
                      isActive 
                        ? 'bg-amber-50 text-amber-800 font-bold dark:bg-amber-900/30 dark:text-amber-300' 
                        : 'hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-stone-900 dark:hover:text-amber-300'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}