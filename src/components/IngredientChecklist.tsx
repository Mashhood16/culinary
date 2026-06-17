'use client';

import { useState } from 'react';

interface ChecklistProps {
  recipeTitle: string;
  ingredients: string[];
}

export default function IngredientChecklist({ recipeTitle, ingredients }: ChecklistProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleChecked = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const exportShoppingList = () => {
    // Collect ingredients that are unchecked (missing from the cook's pantry)
    const missing = ingredients.filter((_, idx) => !checked[idx]);
    const listToExport = missing.length > 0 ? missing : ingredients;

    const textList = [
      `🛒 Missing Ingredients for ${recipeTitle}:`,
      ...listToExport.map((item) => `- [ ] ${item}`),
      `\nShared via Culnarriest.`
    ].join('\n');

    navigator.clipboard.writeText(textList).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="rounded-3xl border border-stone-200 bg-stone-50 p-6 shadow-sm dark:border-stone-850 dark:bg-stone-950/95">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4 mb-4">
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">Ingredients</h2>
        <button
          onClick={exportShoppingList}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-amber-400 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
        >
          {copied ? '✓ Copied List!' : '📋 Export Shopping List'}
        </button>
      </div>
      
      <ul className="grid gap-3 text-sm">
        {ingredients.map((ingredient, idx) => {
          const isChecked = !!checked[idx];
          return (
            <li 
              key={`${ingredient}-${idx}`} 
              onClick={() => toggleChecked(idx)}
              className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm dark:bg-stone-900 cursor-pointer select-none transition-all duration-200 border border-transparent hover:border-amber-200/50 dark:hover:border-stone-800 ${
                isChecked ? 'opacity-50 line-through text-stone-400 dark:text-stone-500' : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              <input 
                type="checkbox" 
                checked={isChecked}
                onChange={() => toggleChecked(idx)}
                className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span>{ingredient}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}