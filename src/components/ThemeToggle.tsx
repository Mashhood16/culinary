'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = (nextTheme: 'light' | 'dark') => {
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem('theme', nextTheme);
  };

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      applyTheme(savedTheme);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }, []);

  return (
    <button
      type="button"
      onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-stone-800 transition hover:border-amber-400 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-amber-400 dark:hover:text-amber-300"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
