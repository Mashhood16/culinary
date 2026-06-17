'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { AdminRecipe } from '@/lib/recipe-store';

export const dynamic = 'force-dynamic';

type RecipeForm = Omit<AdminRecipe, 'tags' | 'ingredients' | 'steps' | 'servings' | 'rating'> & {
  tags: string;
  ingredients: string;
  steps: string;
  slug: string;
  servings: number | '';
  rating: number | '';
};

const defaultForm: RecipeForm = {
  slug: '',
  title: '',
  cuisine: '',
  country: '',
  mealType: '',
  foodType: '',
  description: '',
  history: '',
  prepTime: '',
  cookTime: '',
  totalTime: '',
  difficulty: '',
  servings: 2,
  rating: 5,
  calories: '',
  image: '',
  tags: '',
  ingredients: '',
  steps: '',
  alcoholFree: false,
  containsAlcohol: false,
  status: 'draft',
  sourceType: '',
  licenseNote: '',
  foodSafetyNote: '',
  editorialNote: '',
  historyStatus: '',
  featured: false,
};

export default function EditRecipePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-100 flex items-center justify-center font-sans">
        <p className="text-stone-600 animate-pulse">Loading editor...</p>
      </div>
    }>
      <RecipeEditorContent />
    </Suspense>
  );
}

function RecipeEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('recipe');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [recipeForm, setRecipeForm] = useState<RecipeForm>(defaultForm);
  const recipeFormRef = useRef(recipeForm);

  useEffect(() => {
    recipeFormRef.current = recipeForm;
  }, [recipeForm]);

  useEffect(() => {
    async function checkAuthAndLoadRecipe() {
      try {
        const authRes = await fetch('/api/admin/settings', { cache: 'no-store', credentials: 'same-origin' });
        if (!authRes.ok) {
          router.push(`/admin/login?redirect=/admin/edit?recipe=${slug}`);
          return;
        }

        const recipeRes = await fetch('/api/admin/recipes', { cache: 'no-store', credentials: 'same-origin' });
        if (recipeRes.ok) {
          const data = await recipeRes.json();
          const target = data.find((r: AdminRecipe) => r.slug === slug);
          if (target) {
            setRecipeForm({
              slug: target.slug,
              title: target.title || '',
              cuisine: target.cuisine || '',
              country: target.country || '',
              mealType: target.mealType || '',
              foodType: target.foodType || '',
              description: target.description || '',
              history: target.history || '',
              prepTime: target.prepTime || '',
              cookTime: target.cookTime || '',
              totalTime: target.totalTime || '',
              difficulty: target.difficulty || '',
              servings: target.servings || 2,
              rating: target.rating || 5,
              calories: target.calories || '',
              image: target.image || '',
              tags: Array.isArray(target.tags) ? target.tags.join(', ') : '',
              ingredients: Array.isArray(target.ingredients) ? target.ingredients.join('\n') : '',
              steps: Array.isArray(target.steps) ? target.steps.join('\n\n') : '',
              alcoholFree: Boolean(target.alcoholFree),
              containsAlcohol: Boolean(target.containsAlcohol),
              status: target.status || 'draft',
              sourceType: target.sourceType || '',
              licenseNote: target.licenseNote || '',
              foodSafetyNote: target.foodSafetyNote || '',
              editorialNote: target.editorialNote || '',
              historyStatus: target.historyStatus || '',
              featured: Boolean(target.featured),
            });
          } else {
            setMessage('Recipe not found in database.');
          }
        }
      } catch {
        router.push(`/admin/login?redirect=/admin/edit?recipe=${slug}`);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      checkAuthAndLoadRecipe();
    } else {
      setLoading(false);
      setMessage('No recipe specified to edit.');
    }
  }, [slug, router]);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage('Uploading image to Vercel Blob...');

    try {
      // Create a standard multipart form data payload
      const formData = new FormData();
      formData.append('file', file);

      // Upload the raw file directly to your secure API endpoint
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to upload image.');
      }

      const data = await res.json();
      
      // Update the form state with the high-speed Vercel Blob URL
      setRecipeForm((prev) => ({ ...prev, image: data.url }));
      setMessage('Image uploaded successfully. Save the recipe to apply changes.');
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Failed to upload image to Vercel Blob.');
    } finally {
      // Clear the input value so the same file can be uploaded again if needed
      event.target.value = '';
    }
  }

  async function saveRecipe() {
    if (!recipeForm.title.trim()) {
      setMessage('Recipe title is required.');
      return;
    }

    setSaving(true);
    setMessage('');

    const payload = getPayload(recipeFormRef.current);

    // Call your API route handler. (If your routes are located directly under /admin/recipes
    // instead of /api/admin/recipes, change this URL to '/admin/recipes')
    const response = await fetch('/api/admin/recipes', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Diagnostic Update: Fetch the exact error JSON returned by your server (e.g., 401, 404, or 500)
      const errorData = await response.json().catch(() => ({}));
      setMessage(errorData.error || `Unable to update recipe. (Server returned Status ${response.status})`);
      setSaving(false);
      return;
    }

    setMessage('Recipe updated successfully.');
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center font-sans">
        <p className="text-stone-600 animate-pulse">Verifying session...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 p-6 md:p-12 font-sans text-stone-900">
      <div className="mx-auto max-w-3xl bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-stone-200 space-y-6">
        
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <Link href={slug ? `/recipes/${slug}` : '/'} className="text-sm font-semibold text-amber-700 hover:underline">
            ← Back to Public Recipe
          </Link>
          <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Standalone Editor</span>
        </div>

        <h1 className="text-3xl font-bold text-stone-900">
          Edit &ldquo;{recipeForm.title || slug}&rdquo;
        </h1>

        <div className="grid gap-4">
          <label className="block text-sm font-medium text-stone-700">
            Recipe Title
            <input value={recipeForm.title} onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Slug (URL path segment)
            <input value={recipeForm.slug} disabled className="mt-1 w-full rounded-2xl border border-stone-250 bg-stone-50 p-3 text-stone-500 cursor-not-allowed" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700">
              Cuisine
              <input value={recipeForm.cuisine} onChange={(e) => setRecipeForm({ ...recipeForm, cuisine: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Country
              <input value={recipeForm.country} onChange={(e) => setRecipeForm({ ...recipeForm, country: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700">
              Meal Type
              <input value={recipeForm.mealType} onChange={(e) => setRecipeForm({ ...recipeForm, mealType: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Category
              <input value={recipeForm.foodType} onChange={(e) => setRecipeForm({ ...recipeForm, foodType: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700">
              Prep Time
              <input value={recipeForm.prepTime} onChange={(e) => setRecipeForm({ ...recipeForm, prepTime: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Cook Time
              <input value={recipeForm.cookTime} onChange={(e) => setRecipeForm({ ...recipeForm, cookTime: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700">
              Total Time
              <input value={recipeForm.totalTime} onChange={(e) => setRecipeForm({ ...recipeForm, totalTime: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Difficulty
              <input value={recipeForm.difficulty} onChange={(e) => setRecipeForm({ ...recipeForm, difficulty: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700">
              Servings
              <input type="number" value={recipeForm.servings || ''} onChange={(e) => setRecipeForm({ ...recipeForm, servings: e.target.value === '' ? '' : Number(e.target.value) })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Rating
              <input type="number" min="1" max="5" value={recipeForm.rating || ''} onChange={(e) => setRecipeForm({ ...recipeForm, rating: e.target.value === '' ? '' : Number(e.target.value) })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
            </label>
          </div>

          <label className="block text-sm font-medium text-stone-700">
            Calories
            <input value={recipeForm.calories} onChange={(e) => setRecipeForm({ ...recipeForm, calories: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Tags (comma separated)
            <input value={recipeForm.tags} onChange={(e) => setRecipeForm({ ...recipeForm, tags: e.target.value })} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
          </label>

          <label className="block text-sm font-medium text-stone-700 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
            Image URL
            <input value={recipeForm.image} onChange={(e) => setRecipeForm({ ...recipeForm, image: e.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-3" />
          </label>

          <label className="block text-sm font-medium text-stone-700 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
            Upload Image File
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-3" />
          </label>

          {recipeForm.image ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
              <img src={recipeForm.image} alt="Preview" className="h-48 w-full rounded-xl object-cover" />
            </div>
          ) : null}

          <label className="block text-sm font-medium text-stone-700">
            Description
            <textarea value={recipeForm.description} onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })} rows={3} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            History / Story
            <textarea value={recipeForm.history} onChange={(e) => setRecipeForm({ ...recipeForm, history: e.target.value })} rows={4} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Ingredients (one per line)
            <textarea value={recipeForm.ingredients} onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value })} rows={5} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
          </label>

          <label className="block text-sm font-medium text-stone-700">
            Instructions (one step per paragraph)
            <textarea value={recipeForm.steps} onChange={(e) => setRecipeForm({ ...recipeForm, steps: e.target.value })} rows={8} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm text-stone-700">
              <input type="checkbox" checked={recipeForm.alcoholFree} onChange={(e) => setRecipeForm({ ...recipeForm, alcoholFree: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-600" />
              Suitable without alcohol
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm text-stone-700">
              <input type="checkbox" checked={recipeForm.containsAlcohol} onChange={(e) => setRecipeForm({ ...recipeForm, containsAlcohol: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-600" />
              Contains restricted ingredients
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700 border border-stone-300 rounded-2xl p-3">
              Status
              <select value={recipeForm.status} onChange={(e) => setRecipeForm({ ...recipeForm, status: e.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-2 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="pending review">Pending review</option>
                <option value="review required">Review required</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-stone-700 border border-stone-300 rounded-2xl p-3 flex flex-col justify-between">
              Featured
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={recipeForm.featured} onChange={(e) => setRecipeForm({ ...recipeForm, featured: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-600" />
                Feature recipe on homepage
              </label>
            </label>
          </div>

          <button onClick={saveRecipe} disabled={saving} className="rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
            {saving ? 'Saving changes...' : 'Save changes'}
          </button>

          {message ? <p className="mt-3 text-sm font-semibold text-rose-700">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}