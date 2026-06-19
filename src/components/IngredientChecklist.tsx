'use client';

import { useMemo, useState } from 'react';

interface ChecklistProps {
  recipeTitle: string;
  ingredients: string[];
  originalServings?: number;
  recipeSlug?: string;
}

function parseQuantity(value: string) {
  if (value.includes('/')) {
    const [numerator, denominator] = value.split('/').map(Number);
    return denominator ? numerator / denominator : Number.NaN;
  }
  return Number(value);
}

function formatQuantity(value: number) {
  if (!Number.isFinite(value)) return '';
  if (value >= 10) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
  }
  const rounded = Math.round(value * 4) / 4;
  if (Number.isInteger(rounded)) return String(rounded);
  const whole = Math.floor(rounded);
  const fraction = rounded - whole;
  const fractions: Record<string, string> = {
    '0.25': '1/4',
    '0.5': '1/2',
    '0.75': '3/4',
  };
  const fractionText = fractions[fraction.toString()];
  if (fractionText) return whole ? `${whole} ${fractionText}` : fractionText;
  return rounded.toFixed(2).replace(/0$/, '').replace(/\.0$/, '');
}

function scaleIngredient(ingredient: string, factor: number) {
  const match = ingredient.match(/^(\d+(?:\.\d+)?|\d+\/\d+)(\s+)(.+)$/);
  if (!match) return ingredient;
  const quantity = parseQuantity(match[1]);
  if (!Number.isFinite(quantity)) return ingredient;
  return `${formatQuantity(quantity * factor)}${match[2]}${match[3]}`;
}

export default function IngredientChecklist({ recipeTitle, ingredients, originalServings, recipeSlug }: ChecklistProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [servings, setServings] = useState(originalServings || 4);

  const factor = (originalServings && originalServings > 0) ? servings / originalServings : 1;

  const scaledIngredients = useMemo(
    () => ingredients.map((ingredient) => scaleIngredient(ingredient, factor)),
    [ingredients, factor],
  );

  const toggleChecked = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const exportShoppingList = () => {
    const missing = scaledIngredients.filter((_, idx) => !checked[idx]);
    const listToExport = missing.length > 0 ? missing : scaledIngredients;
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
    <div className="flex flex-col h-full">
      {/* Fixed Top: Servings Controls + Header */}
      <div className="shrink-0 space-y-4">
        {/* Serving Controls */}
        {originalServings && originalServings > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Servings</p>
              <p className="mt-1 text-sm text-stone-500">Original serves {originalServings}. Adjust below.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[2, 4, 6, 8, 12].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setServings(count)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    servings === count 
                      ? 'bg-amber-700 text-white shadow-sm' 
                      : 'bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-800 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  {count}
                </button>
              ))}
              <div className="flex items-center gap-1">
                <span className="text-xs text-stone-400 ml-1">or</span>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={servings}
                  onChange={(event) => setServings(Math.max(1, Math.min(40, Number(event.target.value) || 1)))}
                  className="w-16 rounded-2xl border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 outline-none transition focus:border-amber-500 text-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Ingredients for {servings} people
          </h2>
          <button
            onClick={exportShoppingList}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-amber-400 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
          >
            {copied ? '✓ Copied List!' : '📋 Export Shopping List'}
          </button>
        </div>
      </div>

      {/* Scrollable Ingredient List */}
      <ul className="flex-1 overflow-y-auto min-h-0 mt-4 grid gap-3 text-sm">
        {scaledIngredients.map((ingredient, idx) => {
          const isChecked = !!checked[idx];
          return (
            <li 
              key={`${ingredient}-${idx}`} 
              onClick={() => toggleChecked(idx)}
              className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm dark:bg-stone-900 cursor-pointer select-none transition-all duration-200 border border-transparent hover:border-amber-200/50 dark:hover:border-stone-800 ${
                isChecked ? 'opacity-50' : ''
              }`}
            >
              <input 
                type="checkbox" 
                checked={isChecked}
                readOnly
                className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer pointer-events-none"
              />
              <span className={`transition-all duration-200 ${
                isChecked 
                  ? 'line-through decoration-stone-400/80 dark:decoration-stone-500/80 text-stone-400 dark:text-stone-500' 
                  : 'text-stone-700 dark:text-stone-300'
              }`}>
                {ingredient}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}