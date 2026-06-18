'use client';

import { useEffect, useState } from 'react';

export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const w = window as typeof window & { google?: any; googleTranslateElementInit?: () => void };

    const init = () => {
      if (!w.google?.translate?.TranslateElement) return;

      new w.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,es,fr,de,hi,pt,ar,it,ur',
          layout: w.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );
    };

    w.googleTranslateElementInit = init;

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    if (w.google?.translate?.TranslateElement) {
      init();
    }

    return () => {
      delete w.googleTranslateElementInit;
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select website language"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 shadow-sm transition hover:border-amber-400 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-amber-400 dark:hover:text-amber-300"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
          <path d="M12 3v18M3 12h18" />
          <circle cx="12" cy="12" r="9" />
          <path d="M6 7c2.2 1.8 4.1 4.4 5 7-1.2 2.7-3 5.2-5 7M18 7c-2.2 1.8-4.1 4.4-5 7 1.2 2.7 3 5.2 5 7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-64 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl dark:border-stone-700 dark:bg-stone-950">
          <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">Language</p>
          <div id="google_translate_element" className="language-dropdown" />
        </div>
      )}
    </div>
  );
}
