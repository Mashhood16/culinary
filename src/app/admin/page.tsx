'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { AdminRecipe } from '@/lib/recipe-store';
import { getImageUrl } from '@/lib/recipe-image'; // Added missing import

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
  slug: '', title: '', cuisine: '', country: '', mealType: '', foodType: '', description: '',
  history: '', prepTime: '', cookTime: '', totalTime: '', difficulty: '', servings: 2, rating: 5,
  calories: '', image: '', tags: '', ingredients: '', steps: '', alcoholFree: false,
  containsAlcohol: false, status: 'draft', sourceType: '', licenseNote: '', foodSafetyNote: '',
  editorialNote: '', historyStatus: '', featured: false,
};

function generateSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getPayload(form: RecipeForm) {
  return {
    ...form,
    tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    ingredients: form.ingredients.split('\n').map((item) => item.trim()).filter(Boolean),
    steps: form.steps.split('\n').map((step) => step.trim()).filter(Boolean),
    servings: Number(form.servings) || 2,
    rating: Number(form.rating) || 5,
    image: form.image || '',
    slug: form.slug || generateSlug(form.title || 'recipe'),
  };
}

export default function EditRecipePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-100 flex items-center justify-center">Loading...</div>}>
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

  useEffect(() => { recipeFormRef.current = recipeForm; }, [recipeForm]);

  useEffect(() => {
    async function checkAuthAndLoadRecipe() {
      try {
        const authRes = await fetch('/api/admin/settings', { cache: 'no-store', credentials: 'same-origin' });
        if (!authRes.ok) {
          router.push(`/admin/login?redirect=${encodeURIComponent(`/admin/edit?recipe=${slug}`)}`);
          return;
        }
        const recipeRes = await fetch('/api/admin/recipes', { cache: 'no-store', credentials: 'same-origin' });
        if (recipeRes.ok) {
          const data = await recipeRes.json();
          const target = data.find((r: AdminRecipe) => r.slug === slug);
          if (target) {
            setRecipeForm({
              ...defaultForm,
              slug: target.slug,
              title: target.title || '',
              // ... map remaining fields here from 'target' ...
              cuisine: target.cuisine || '',
              description: target.description || '',
              image: typeof target.image === 'string' ? target.image : (target.image?.publicId || ''),
              status: target.status || 'draft',
              featured: Boolean(target.featured),
            });
          }
        }
      } catch {
        router.push(`/admin/login?redirect=${encodeURIComponent(`/admin/edit?recipe=${slug}`)}`);
      } finally {
        setLoading(false);
      }
    }
    if (slug) checkAuthAndLoadRecipe();
  }, [slug, router]);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setRecipeForm((prev) => ({ ...prev, image: data.url }));
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  async function saveRecipe() {
    setSaving(true);
    const payload = getPayload(recipeFormRef.current);
    const response = await fetch('/api/admin/recipes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setMessage(response.ok ? 'Updated!' : 'Error updating.');
  }

  if (loading) return <div>Loading...</div>;

  return (
    <main className="p-10 bg-stone-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Edit {recipeForm.title}</h1>
        
        {/* Fixed Preview Section */}
        {recipeForm.image ? (
          <div className="rounded-2xl border p-2 mb-4">
            <Image 
              src={getImageUrl(recipeForm.image, { width: 400, height: 200 })} 
              alt="Preview" 
              width={400} 
              height={200} 
              unoptimized
              className="w-full rounded-xl" 
            />
          </div>
        ) : null}

        <input value={recipeForm.title} onChange={(e) => setRecipeForm({...recipeForm, title: e.target.value})} className="w-full border p-2 mb-2" />
        <button onClick={saveRecipe} className="bg-amber-600 text-white px-4 py-2 rounded-full">{saving ? 'Saving...' : 'Save'}</button>
        {message && <p>{message}</p>}
      </div>
    </main>
  );
}