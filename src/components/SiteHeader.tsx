'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 1. Added usePathname
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';


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
  const pathname = usePathname(); // 2. Get current path

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 shadow-sm backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/90">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          href="/"
          className="shrink-0 flex items-center"
          onClick={() => setIsOpen(false)}
        >
          <Image src="/logo-light.png" alt="Culinarriest" width={220} height={88} className="h-[48px] md:h-[56px] lg:h-[64px] w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-200">
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              // 3. Highlight Logic: If current path matches href, use amber colors
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