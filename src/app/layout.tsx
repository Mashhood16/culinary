import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Inter, Playfair_Display } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Culnarriest',
  description: 'A premium recipe discovery and AI-assisted food science platform.',
  metadataBase: new URL('https://culnarriest.example'),
  themeColor: '#fffaf6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        <SiteHeader />
        {children}
        <footer className="border-t border-stone-200 bg-stone-950 text-stone-200 dark:border-stone-800 dark:bg-stone-950">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 text-sm lg:grid-cols-4 lg:px-10">
            <div>Culnarriest • premium global recipes, AI guidance, and safe cooking recommendations.</div>
            <div><strong>Explore</strong><br /><Link href="/">Home</Link><br /><Link href="/recipes">Recipes</Link><br /><Link href="/recipe-of-the-day">Recipe of the Day</Link></div>
            <div><strong>Support</strong><br /><Link href="/help">Help</Link><br /><Link href="/contact">Contact</Link><br /><Link href="/about">About</Link></div>
            <div><strong>Policy</strong><br /><Link href="/policy">Site policy</Link><br /><Link href="/privacy">Privacy</Link><br /><Link href="/terms">Terms</Link></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
