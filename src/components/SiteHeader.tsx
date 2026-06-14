"use client";

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

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

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 shadow-sm backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/90">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          href="/"
          className="rounded-full border border-amber-200 bg-amber-50/90 px-4 py-2 text-xl font-semibold tracking-[0.18em] text-amber-900 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900/70 dark:bg-stone-900/90 dark:text-amber-200"
          onClick={() => setIsOpen(false)}
        >
          CULNARRIEST
        </Link>

        <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-200">
          <div className="hidden items-center gap-5 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 transition hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-stone-900 dark:hover:text-amber-300"
              >
                {item.label}
              </Link>
            ))}
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 transition hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-stone-900 dark:hover:text-amber-300"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
