'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface RecipeFiltersProps {
  cuisines: string[];
  mealTypes: string[];
  difficulties?: string[];
}

export default function RecipeFilters({ cuisines, mealTypes, difficulties = ['Easy', 'Medium', 'Hard'] }: RecipeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [mealType, setMealType] = useState(searchParams.get('mealType') || 'All');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'All');

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setCuisine(searchParams.get('cuisine') || 'All');
    setMealType(searchParams.get('mealType') || 'All');
    setDifficulty(searchParams.get('difficulty') || 'All');
  }, [searchParams]);

  const applyFilters = (newSearch: string, newCuisine: string, newMealType: string, newDifficulty: string) => {
    const params = new URLSearchParams();
    if (newSearch.trim()) params.set('q', newSearch.trim());
    if (newCuisine !== 'All') params.set('cuisine', newCuisine);
    if (newMealType !== 'All') params.set('mealType', newMealType);
    if (newDifficulty !== 'All') params.set('difficulty', newDifficulty);

    const queryString = params.toString();
    router.push(`/recipes${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-4 w-full">
      {/* 1. Keyword Search Input */}
      <div className="relative w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            applyFilters(e.target.value, cuisine, mealType, difficulty);
          }}
          placeholder="Search recipes..."
          className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 pl-10 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:bg-white dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-100 dark:focus:bg-stone-950"
        />
        <svg className="absolute left-3.5 top-4 h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 2. Dynamic Cuisine Dropdown */}
      <select
        value={cuisine}
        onChange={(e) => {
          setCuisine(e.target.value);
          applyFilters(search, e.target.value, mealType, difficulty);
        }}
        className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 text-sm text-stone-700 outline-none transition focus:border-amber-500 focus:bg-white dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300 dark:focus:bg-stone-950 font-medium cursor-pointer"
      >
        <option value="All">All Cuisines</option>
        {cuisines.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* 3. Dynamic Meal Type Dropdown */}
      <select
        value={mealType}
        onChange={(e) => {
          setMealType(e.target.value);
          applyFilters(search, cuisine, e.target.value, difficulty);
        }}
        className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 text-sm text-stone-700 outline-none transition focus:border-amber-500 focus:bg-white dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300 dark:focus:bg-stone-950 font-medium cursor-pointer"
      >
        <option value="All">All Meal Types</option>
        {mealTypes.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* 4. Difficulty Dropdown */}
      <select
        value={difficulty}
        onChange={(e) => {
          setDifficulty(e.target.value);
          applyFilters(search, cuisine, mealType, e.target.value);
        }}
        className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 text-sm text-stone-700 outline-none transition focus:border-amber-500 focus:bg-white dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300 dark:focus:bg-stone-950 font-medium cursor-pointer"
      >
        <option value="All">All Difficulties</option>
        {difficulties.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  );
}