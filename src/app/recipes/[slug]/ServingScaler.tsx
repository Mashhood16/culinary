'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type ServingScalerProps = {
  recipeSlug: string;
  originalServings: number;
  ingredients: string[];
};

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

export default function ServingScaler({ recipeSlug, originalServings, ingredients }: ServingScalerProps) {
  const [servings, setServings] = useState(originalServings);
  const factor = servings / originalServings;

  const scaledIngredients = useMemo(
    () => ingredients.map((ingredient) => scaleIngredient(ingredient, factor)),
    [ingredients, factor],
  );

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">AI serving scaler</p>
          <h2 className="mt-2 text-xl font-semibold">Ingredients for {servings} people</h2>
          <p className="mt-2 text-sm text-stone-600">Original recipe serves {originalServings}. Adjust the people count and the quantities update instantly.</p>
        </div>
        <label className="text-sm font-semibold text-stone-700">
          People
          <input
            type="number"
            min={1}
            max={40}
            value={servings}
            onChange={(event) => setServings(Math.max(1, Math.min(40, Number(event.target.value) || 1)))}
            className="mt-2 w-28 rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none transition focus:border-amber-500"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-700">
        {[2, 4, 6, 8, 12].map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => setServings(count)}
            className={`rounded-full px-3 py-1.5 transition ${servings === count ? 'bg-amber-700 text-white' : 'bg-stone-100 hover:bg-amber-100 hover:text-amber-800'}`}
          >
            {count}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-2 text-sm text-stone-700">
        {scaledIngredients.map((item) => <li key={item} className="rounded-2xl bg-stone-50 px-3 py-2">- {item}</li>)}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link href={`/ai?recipe=${recipeSlug}&servings=${servings}`} className="rounded-full bg-amber-700 px-4 py-2 text-sm font-semibold text-white">
          Ask AI to adapt for {servings}
        </Link>
        <button type="button" onClick={() => setServings(originalServings)} className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-800">
          Reset
        </button>
      </div>
    </div>
  );
}
