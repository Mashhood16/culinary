import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Inter, Playfair_Display } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import { themeConfig } from '@/config/themeConfig';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: themeConfig.brandName,
  description: `A premium recipe discovery and AI-assisted food science platform by ${themeConfig.brandName}.`,
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: themeConfig.logoUrl,
  },
};

export const viewport = {
  themeColor: '#fffaf6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-primary: ${themeConfig.colors.primary};
              --color-primary-hover: ${themeConfig.colors.primaryHover};
              --color-secondary: ${themeConfig.colors.secondary};
              --color-accent: ${themeConfig.colors.accent};
              --color-accent-hover: ${themeConfig.colors.accentHover};
            }
          `
        }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Theme initialization failed: ', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#fdfbf7] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-[#fdfbf7] to-[#f3efe6] text-stone-900 antialiased dark:bg-stone-950 dark:bg-none dark:text-stone-100 transition-colors duration-200">
        <SiteHeader />
        {children}
        <footer className="border-t border-stone-200 bg-stone-950 text-stone-200 dark:border-stone-800 dark:bg-stone-950">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 text-sm lg:grid-cols-4 lg:px-10">
            <div>
              <p className="font-bold mb-2 text-lg">{themeConfig.brandName}</p>
              <p className="mb-4 text-stone-400">Premium global recipes, AI guidance, and safe cooking recommendations.</p>
              <div className="flex gap-4 text-brand-accent">
                <a href={themeConfig.socials.instagram} target="_blank" rel="noreferrer" className="hover:text-brand-accentHover">Instagram</a>
                <a href={themeConfig.socials.youtube} target="_blank" rel="noreferrer" className="hover:text-brand-accentHover">YouTube</a>
                <a href={themeConfig.socials.twitter} target="_blank" rel="noreferrer" className="hover:text-brand-accentHover">Twitter</a>
              </div>
            </div>
            <div><strong>Explore</strong><br /><Link href="/">Home</Link><br /><Link href="/recipes">Recipes</Link><br /><Link href="/recipe-of-the-day">Recipe of the Day</Link></div>
            <div><strong>Support</strong><br /><Link href="/help">Help</Link><br /><Link href="/contact">Contact</Link><br /><Link href="/about">About</Link></div>
            <div><strong>Policy</strong><br /><Link href="/policy">Site policy</Link><br /><Link href="/privacy">Privacy</Link><br /><Link href="/terms">Terms</Link></div>
          </div>
        </footer>
      </body>
    </html>
  );
}