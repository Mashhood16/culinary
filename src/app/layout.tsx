import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Global Recipe Hub',
  description: 'A premium, alcohol-free recipe discovery and AI-assisted food science platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/90">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
            <Link href="/" className="rounded-full border border-amber-200 bg-amber-50/90 px-4 py-2 text-xl font-semibold tracking-[0.18em] text-amber-900 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900/70 dark:bg-stone-900/90 dark:text-amber-200">GLOBAL RECIPE HUB</Link>
            <div className="flex items-center gap-3 text-sm text-stone-700 dark:text-stone-200">
              <div className="hidden items-center gap-5 lg:flex">
              <Link href="/recipe-of-the-day" className="transition hover:text-amber-700 dark:hover:text-amber-300">Recipe of the Day</Link>
              <Link href="/recipes" className="transition hover:text-amber-700 dark:hover:text-amber-300">Recipes</Link>
              <Link href="/cuisines" className="transition hover:text-amber-700 dark:hover:text-amber-300">Cuisines</Link>
              <Link href="/ai" className="transition hover:text-amber-700 dark:hover:text-amber-300">AI Food Scientist</Link>
              <Link href="/about" className="transition hover:text-amber-700 dark:hover:text-amber-300">About</Link>
              <Link href="/help" className="transition hover:text-amber-700 dark:hover:text-amber-300">Help</Link>
              <Link href="/contact" className="transition hover:text-amber-700 dark:hover:text-amber-300">Contact</Link>
              </div>
              <ThemeToggle />
            </div>
          </nav>
        </header>
        {children}
        <footer className="border-t border-stone-200 bg-stone-950 text-stone-200 dark:border-stone-800 dark:bg-stone-950">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 text-sm lg:grid-cols-4 lg:px-10">
            <div>Global Recipe Hub • premium global recipes, AI guidance, and strict alcohol-free policy.</div>
            <div><strong>Explore</strong><br />Home<br />Recipes<br />Recipe of the Day</div>
            <div><strong>Support</strong><br />Help<br />Contact<br />About</div>
            <div><strong>Policy</strong><br />Alcohol-free recipe policy<br />Privacy<br />Terms</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
