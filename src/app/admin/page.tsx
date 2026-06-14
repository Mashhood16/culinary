'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({ enabled: true, model: 'meta-llama/llama-3.1-8b-instruct', systemPrompt: '', apiKey: '' });
  const [apiKey, setApiKey] = useState('');
  const [adminRecipes, setAdminRecipes] = useState<any[]>([]);
  const [searchRecipeTerm, setSearchRecipeTerm] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const imageRef = useRef('');
  const [recipeForm, setRecipeForm] = useState({ title: '', cuisine: '', country: '', mealType: '', foodType: '', description: '', history: '', prepTime: '', cookTime: '', totalTime: '', difficulty: '', servings: '' as number | '', rating: '' as number | '', calories: '', image: '', tags: '', ingredients: '', steps: '', alcoholFree: false, containsAlcohol: false, status: '', sourceType: '', licenseNote: '', foodSafetyNote: '', editorialNote: '', historyStatus: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/recipes', { cache: 'no-store', credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => setAdminRecipes(Array.isArray(data) ? data : []))
      .catch(() => setAdminRecipes([]));

    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setSettings({
          enabled: Boolean(data.enabled),
          model: data.model || 'meta-llama/llama-3.1-8b-instruct',
          systemPrompt: data.systemPrompt || '',
          apiKey: data.apiKey || '',
        });
        setApiKey(data.apiKey || '');
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  async function saveSettings() {
    setSaving(true);
    setMessage('');

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, apiKey }),
    });

    if (!res.ok) {
      setMessage('Unable to save settings.');
      setSaving(false);
      return;
    }

    setMessage('AI settings saved successfully.');
    setSaving(false);
  }

  function resetRecipeForm() {
    setRecipeForm({ title: '', cuisine: '', country: '', mealType: '', foodType: '', description: '', history: '', prepTime: '', cookTime: '', totalTime: '', difficulty: '', servings: '', rating: '', calories: '', image: '', tags: '', ingredients: '', steps: '', alcoholFree: false, containsAlcohol: false, status: '', sourceType: '', licenseNote: '', foodSafetyNote: '', editorialNote: '', historyStatus: '' });
    imageRef.current = '';
    setEditingSlug('');
  }

  function loadRecipeForEdit(recipe: any) {
    setEditingSlug(recipe.slug);
    imageRef.current = recipe.image || '';
    setRecipeForm({
      title: recipe.title || '',
      cuisine: recipe.cuisine || '',
      country: recipe.country || '',
      mealType: recipe.mealType || '',
      foodType: recipe.foodType || '',
      description: recipe.description || '',
      history: recipe.history || '',
      prepTime: recipe.prepTime || '',
      cookTime: recipe.cookTime || '',
      totalTime: recipe.totalTime || '',
      difficulty: recipe.difficulty || '',
      servings: Number(recipe.servings || ''),
      rating: Number(recipe.rating || ''),
      calories: recipe.calories || '',
      image: recipe.image || '',
      tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
      steps: Array.isArray(recipe.steps) ? recipe.steps.join('\n') : '',
      alcoholFree: Boolean(recipe.alcoholFree),
      containsAlcohol: Boolean(recipe.containsAlcohol),
      status: recipe.status || '',
      sourceType: recipe.sourceType || '',
      licenseNote: recipe.licenseNote || '',
      foodSafetyNote: recipe.foodSafetyNote || '',
      editorialNote: recipe.editorialNote || '',
      historyStatus: recipe.historyStatus || '',
    });
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const result = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Unable to read image file.'));
      reader.readAsDataURL(file);
    });

    imageRef.current = result;
    setRecipeForm((prev) => ({ ...prev, image: result }));
    event.target.value = '';
  }

  async function saveRecipe() {
    setSaving(true);
    setMessage('');

    const payload = {
      ...recipeForm,
      image: imageRef.current || recipeForm.image,
      servings: Number(recipeForm.servings) || 2,
      rating: Number(recipeForm.rating) || 5,
      slug: editingSlug || undefined,
      tags: recipeForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      ingredients: recipeForm.ingredients.split('\n').map((item) => item.trim()).filter(Boolean),
      steps: recipeForm.steps.split('\n').map((step) => step.trim()).filter(Boolean),
    };

    const res = await fetch('/api/admin/recipes', {
      method: editingSlug ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setMessage(editingSlug ? 'Unable to update recipe.' : 'Unable to add recipe.');
      setSaving(false);
      return;
    }

    const data = await res.json();
    setAdminRecipes(Array.isArray(data) ? data : []);
    setMessage(editingSlug ? 'Recipe updated successfully.' : 'Recipe added successfully.');
    resetRecipeForm();
    setSaving(false);
  }

  const filteredRecipes = adminRecipes.filter((recipe) => {
    const term = searchRecipeTerm.toLowerCase();
    return !term || [recipe.title, recipe.cuisine, recipe.mealType, recipe.slug].some((value) => String(value || '').toLowerCase().includes(term));
  });

  return (
    <main className="min-h-screen bg-stone-100 p-10 text-stone-900">
      <div className="mx-auto max-w-5xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Admin Panel</p>
        <h1 className="mt-3 text-3xl font-semibold">AI settings</h1>
        <p className="mt-3 text-stone-600">Update the AI model, prompt style, and feature toggle for the public AI page, then add new recipes from this dashboard.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
            <h2 className="text-xl font-semibold">AI settings</h2>
            <div className="mt-4 space-y-4 text-sm text-stone-700">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-600" />
                Enable AI helper on the public page
              </label>
              <label className="block">
                <span className="font-medium text-stone-900">Model</span>
                <input value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 bg-white p-3" />
              </label>
              <label className="block">
                <span className="font-medium text-stone-900">System prompt</span>
                <textarea rows={5} value={settings.systemPrompt} onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 bg-white p-3" />
              </label>
              <button onClick={saveSettings} disabled={saving} className="rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save settings'}</button>
              {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
            <h2 className="text-xl font-semibold">AI API key</h2>
            <p className="mt-2 text-sm text-stone-600">Add the key here or keep it in GEMINI_API_KEY / GOOGLE_API_KEY. The saved key is used for real AI replies.</p>
            <textarea value={apiKey} onChange={(e) => setApiKey(e.target.value)} rows={4} className="mt-4 w-full rounded-2xl border border-stone-300 bg-white p-3 text-sm" placeholder="Paste your Gemini API key here" />
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{editingSlug ? 'Edit recipe' : 'Add a recipe'}</h2>
              <p className="mt-1 text-sm text-stone-600">Choose an existing recipe below to edit it, or start a new one from scratch.</p>
            </div>
            <button onClick={resetRecipeForm} className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700">New recipe</button>
          </div>

          <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <label className="text-sm font-medium text-stone-900">Search recipe to edit</label>
            <input
              value={searchRecipeTerm}
              onChange={(e) => setSearchRecipeTerm(e.target.value)}
              placeholder="Search by title, cuisine, meal type, or slug"
              className="mt-2 w-full rounded-2xl border border-stone-300 bg-white p-3 text-sm"
            />
            <select
              value={editingSlug}
              onChange={(e) => {
                const selected = adminRecipes.find((recipe) => recipe.slug === e.target.value);
                if (selected) loadRecipeForEdit(selected);
                else resetRecipeForm();
              }}
              className="mt-3 w-full rounded-2xl border border-stone-300 bg-white p-3 text-sm"
            >
              <option value="">Start a new recipe</option>
              {filteredRecipes.map((recipe) => <option key={recipe.slug} value={recipe.slug}>{recipe.title || recipe.slug}</option>)}
            </select>
            <p className="mt-2 text-xs text-stone-500">Pick any recipe here to load its full form for editing.</p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {filteredRecipes.slice(0, 8).map((recipe) => (
              <button
                key={recipe.slug}
                type="button"
                onClick={() => loadRecipeForEdit(recipe)}
                className="rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-400 hover:bg-amber-50"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-amber-700">Edit</p>
                <h3 className="mt-2 text-base font-semibold text-stone-900">{recipe.title}</h3>
                <p className="mt-1 text-sm text-stone-600">{recipe.cuisine} • {recipe.mealType}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input value={recipeForm.title} onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })} placeholder="Recipe title" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.cuisine} onChange={(e) => setRecipeForm({ ...recipeForm, cuisine: e.target.value })} placeholder="Cuisine" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.country} onChange={(e) => setRecipeForm({ ...recipeForm, country: e.target.value })} placeholder="Country" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.mealType} onChange={(e) => setRecipeForm({ ...recipeForm, mealType: e.target.value })} placeholder="Meal type" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.foodType} onChange={(e) => setRecipeForm({ ...recipeForm, foodType: e.target.value })} placeholder="Food type" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.prepTime} onChange={(e) => setRecipeForm({ ...recipeForm, prepTime: e.target.value })} placeholder="Prep time" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.cookTime} onChange={(e) => setRecipeForm({ ...recipeForm, cookTime: e.target.value })} placeholder="Cook time" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.totalTime} onChange={(e) => setRecipeForm({ ...recipeForm, totalTime: e.target.value })} placeholder="Total time" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.difficulty} onChange={(e) => setRecipeForm({ ...recipeForm, difficulty: e.target.value })} placeholder="Difficulty" className="rounded-2xl border border-stone-300 p-3" />
            <input type="number" value={recipeForm.servings || ''} onChange={(e) => setRecipeForm({ ...recipeForm, servings: e.target.value === '' ? '' : Number(e.target.value) })} placeholder="Servings" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.rating || ''} type="number" min="1" max="5" onChange={(e) => setRecipeForm({ ...recipeForm, rating: e.target.value === '' ? '' : Number(e.target.value) })} placeholder="Rating (1–5)" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.calories} onChange={(e) => setRecipeForm({ ...recipeForm, calories: e.target.value })} placeholder="Calories" className="rounded-2xl border border-stone-300 p-3" />
            <input value={recipeForm.tags} onChange={(e) => setRecipeForm({ ...recipeForm, tags: e.target.value })} placeholder="Tags (comma separated)" className="rounded-2xl border border-stone-300 p-3" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.8fr]">
            <label className="rounded-2xl border border-stone-300 bg-stone-50 p-4 text-sm text-stone-700">
              <span className="mb-2 block font-medium text-stone-900">Image URL</span>
              <input
                value={recipeForm.image}
                onChange={(e) => {
                  imageRef.current = e.target.value;
                  setRecipeForm({ ...recipeForm, image: e.target.value });
                }}
                placeholder="Paste image URL or upload a file below"
                className="w-full rounded-2xl border border-stone-300 bg-white p-3"
              />
            </label>
            <label className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-700">
              <span className="mb-2 block font-medium text-stone-900">Upload image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full rounded-2xl border border-stone-300 bg-white p-3" />
              <p className="mt-2 text-xs text-stone-500">This stores the image as a data URL for quick use in the recipe card.</p>
            </label>
          </div>
          {recipeForm.image ? <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-3"><img src={recipeForm.image} alt="Recipe preview" className="h-32 w-full rounded-xl object-cover" /></div> : null}
          <textarea value={recipeForm.description} onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })} placeholder="Short description" rows={3} className="mt-4 w-full rounded-2xl border border-stone-300 p-3" />
          <textarea value={recipeForm.history} onChange={(e) => setRecipeForm({ ...recipeForm, history: e.target.value })} placeholder="Recipe history" rows={3} className="mt-4 w-full rounded-2xl border border-stone-300 p-3" />
          <textarea value={recipeForm.ingredients} onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value })} placeholder="Ingredients (one per line)" rows={5} className="mt-4 w-full rounded-2xl border border-stone-300 p-3" />
          <textarea value={recipeForm.steps} onChange={(e) => setRecipeForm({ ...recipeForm, steps: e.target.value })} placeholder="Method steps (one per line)" rows={6} className="mt-4 w-full rounded-2xl border border-stone-300 p-3" />
          <textarea value={recipeForm.licenseNote} onChange={(e) => setRecipeForm({ ...recipeForm, licenseNote: e.target.value })} placeholder="License note" rows={2} className="mt-4 w-full rounded-2xl border border-stone-300 p-3" />
          <textarea value={recipeForm.foodSafetyNote} onChange={(e) => setRecipeForm({ ...recipeForm, foodSafetyNote: e.target.value })} placeholder="Food safety note" rows={2} className="mt-4 w-full rounded-2xl border border-stone-300 p-3" />
          <textarea value={recipeForm.editorialNote} onChange={(e) => setRecipeForm({ ...recipeForm, editorialNote: e.target.value })} placeholder="Editorial note" rows={2} className="mt-4 w-full rounded-2xl border border-stone-300 p-3" />
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-700">
            <label className="flex items-center gap-2"><input type="checkbox" checked={recipeForm.alcoholFree} onChange={(e) => setRecipeForm({ ...recipeForm, alcoholFree: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-600" />Alcohol-free</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={recipeForm.containsAlcohol} onChange={(e) => setRecipeForm({ ...recipeForm, containsAlcohol: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-600" />Contains alcohol</label>
          </div>
          <button onClick={saveRecipe} disabled={saving} className="mt-4 rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">{saving ? (editingSlug ? 'Saving…' : 'Adding…') : (editingSlug ? 'Save changes' : 'Add recipe')}</button>
          {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
        </section>
      </div>
    </main>
  );
}

