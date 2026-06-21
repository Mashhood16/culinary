'use client';

import { useMemo, useState } from 'react';
import { useUnitSystem } from '@/hooks/useUnitSystem';
import { convertIngredientUnits } from '@/lib/unit-converter';

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
  const [multiplier, setMultiplier] = useState(1);
  const { unitSystem, toggleUnitSystem, isClient } = useUnitSystem();

  const scaledIngredients = useMemo(() => {
    return ingredients.map((ingredient) => {
      // 1. Scale the ingredient based on the multiplier
      const scaled = scaleIngredient(ingredient, multiplier);
      // 2. Convert to the active unit system
      return convertIngredientUnits(scaled, unitSystem);
    });
  }, [ingredients, multiplier, unitSystem]);

  const toggleChecked = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const exportShoppingList = () => {
    const missing = scaledIngredients.filter((_, idx) => !checked[idx]);
    const listToExport = missing.length > 0 ? missing : scaledIngredients;
    const textList = [
      `🛒 Missing Ingredients for ${recipeTitle} (${multiplier}x Batch):`,
      ...listToExport.map((item) => `- [ ] ${item}`),
      `\nShared via Culinarriest.`
    ].join('\n');
    navigator.clipboard.writeText(textList).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Top: Batch Controls + Header */}
      <div className="shrink-0 space-y-4">
        {/* Batch Size & Unit Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between bg-stone-50 dark:bg-stone-900/50 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-primary font-bold">Batch Size Multiplier</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {originalServings && originalServings > 0 ? `Base recipe serves ${originalServings}. Scale it up below.` : 'Scale the recipe ingredients.'}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {[1, 2, 3, 5, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setMultiplier(count)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition border ${
                    multiplier === count 
                      ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                      : 'bg-white border-stone-200 text-stone-600 hover:border-brand-accent hover:text-brand-primary dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                  }`}
                >
                  {count}x
                </button>
              ))}
              <div className="flex items-center gap-1">
                <span className="text-xs text-stone-400 mx-1">or</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={multiplier}
                  onChange={(event) => setMultiplier(Math.max(1, Math.min(100, Number(event.target.value) || 1)))}
                  className="w-16 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 outline-none transition focus:border-brand-primary text-center dark:bg-stone-800 dark:border-stone-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Unit System Toggle */}
          {isClient && (
            <div className="sm:text-right mt-2 sm:mt-0">
               <p className="text-xs uppercase tracking-[0.3em] text-stone-500 font-bold mb-2 sm:mb-3">Measurement</p>
               <button
                  onClick={toggleUnitSystem}
                  className="relative inline-flex h-8 w-40 items-center rounded-full bg-stone-200 dark:bg-stone-800 p-1 cursor-pointer transition-colors"
                >
                  <div
                    className={`absolute left-1 h-6 w-[74px] rounded-full bg-white dark:bg-stone-700 shadow-sm transition-transform duration-300 ease-in-out ${
                      unitSystem === 'imperial' ? 'translate-x-[78px]' : 'translate-x-0'
                    }`}
                  />
                  <span className={`relative z-10 w-1/2 text-center text-[10px] font-bold uppercase tracking-wider transition-colors ${unitSystem === 'metric' ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>
                    Metric
                  </span>
                  <span className={`relative z-10 w-1/2 text-center text-[10px] font-bold uppercase tracking-wider transition-colors ${unitSystem === 'imperial' ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>
                    Imperial
                  </span>
               </button>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4 pt-2">
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Ingredients
            {originalServings && originalServings > 0 && <span className="ml-2 text-lg text-stone-500 font-sans font-normal">(Makes {originalServings * multiplier} servings)</span>}
          </h2>
          <button
            onClick={exportShoppingList}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-brand-accentHover hover:text-brand-primary dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-brand-primary"
          >
            {copied ? '✓ Copied List!' : '📋 Export Shopping List'}
          </button>
        </div>
      </div>

      {/* Scrollable Ingredient List */}
      <ul className="flex-1 overflow-y-auto min-h-0 mt-4 grid gap-3 text-sm pr-2">
        {scaledIngredients.map((ingredient, idx) => {
          const isChecked = !!checked[idx];
          return (
            <li 
              key={`${ingredient}-${idx}`} 
              onClick={() => toggleChecked(idx)}
              className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm dark:bg-stone-900 cursor-pointer select-none transition-all duration-200 border border-transparent hover:border-brand-accent/50 dark:hover:border-stone-800 ${
                isChecked ? 'opacity-50' : ''
              }`}
            >
              <input 
                type="checkbox" 
                checked={isChecked}
                readOnly
                className="h-4 w-4 rounded border-stone-300 text-brand-primary focus:ring-brand-primary cursor-pointer pointer-events-none"
              />
              <span className={`transition-all duration-200 ${
                isChecked 
                  ? 'line-through decoration-stone-400/80 dark:decoration-stone-500/80 text-stone-400 dark:text-stone-500' 
                  : 'text-stone-700 dark:text-stone-300 font-medium'
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