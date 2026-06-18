'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminRecipe } from '@/lib/recipe-store';

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

function generateSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseMinutes(value: string) {
  const match = String(value).match(/(\d+)\s*(min|minutes|m)?/i);
  return match ? Number(match[1]) : NaN;
}

function computeTotalTime(prep: string, cook: string) {
  const prepMinutes = parseMinutes(prep);
  const cookMinutes = parseMinutes(cook);
  if (Number.isNaN(prepMinutes) || Number.isNaN(cookMinutes)) {
    return '';
  }
  return `${prepMinutes + cookMinutes} min`;
}

export default function AdminPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({ 
    enabled: true, 
    model: 'meta-llama/llama-3.1-8b-instruct', 
    systemPrompt: '', 
    systemPromptModify: '', // Holds the separate Recipe Modifier prompt
    apiKey: '' 
  });
  const [apiKey, setApiKey] = useState('');
  const [adminRecipes, setAdminRecipes] = useState<AdminRecipe[]>([]);
  const [searchRecipeTerm, setSearchRecipeTerm] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const [recipeForm, setRecipeForm] = useState<RecipeForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const recipeFormRef = useRef(recipeForm);
  const [statusFilter, setStatusFilter] = useState('All');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [mealFilter, setMealFilter] = useState('All');
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkFileName, setBulkFileName] = useState('');
  const [selectedRecipeSlugs, setSelectedRecipeSlugs] = useState<string[]>([]);
  const [bulkEditStatus, setBulkEditStatus] = useState('');
  const [bulkEditCuisine, setBulkEditCuisine] = useState('');
  const [bulkEditMealType, setBulkEditMealType] = useState('');
  const [bulkEditFeatured, setBulkEditFeatured] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'recipes' | 'allRecipes' | 'editor' | 'import' | 'settings' | 'danger'>('overview');
  const [recipeImageDrafts, setRecipeImageDrafts] = useState<Record<string, string>>({});
  const [savingRecipeImageSlug, setSavingRecipeImageSlug] = useState<string | null>(null);

  const cuisines = useMemo(() => Array.from(new Set(adminRecipes.map((recipe) => recipe.cuisine))).filter(Boolean).sort(), [adminRecipes]);
  const mealTypes = useMemo(() => Array.from(new Set(adminRecipes.map((recipe) => recipe.mealType))).filter(Boolean).sort(), [adminRecipes]);
  const categories = useMemo(() => Array.from(new Set(adminRecipes.map((recipe) => recipe.foodType))).filter(Boolean).sort(), [adminRecipes]);
  const totalIngredients = useMemo(
    () => adminRecipes.reduce((sum, recipe) => sum + (Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0), 0),
    [adminRecipes]
  );

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const recipeRes = await fetch('/api/admin/recipes', { cache: 'no-store', credentials: 'same-origin' });
        if (!recipeRes.ok) throw new Error('Unauthorized');
        const recipeData = await recipeRes.json();
        setAdminRecipes(Array.isArray(recipeData) ? recipeData : []);
      } catch {
        setAdminRecipes([]);
      }

      try {
        const settingsRes = await fetch('/api/admin/settings', { cache: 'no-store', credentials: 'same-origin' });
        if (!settingsRes.ok) throw new Error('Unauthorized');
        const data = await settingsRes.json();
        setSettings({
          enabled: Boolean(data.enabled),
          model: data.model || 'meta-llama/llama-3.1-8b-instruct',
          systemPrompt: data.systemPrompt || '',
          systemPromptModify: data.systemPromptModify || '', // Load the modifier prompt
          apiKey: data.apiKey || '',
        });
        setApiKey(data.apiKey || '');
      } catch {
        router.push('/admin/login');
      }
    };

    loadAdminData();
  }, [router]);

  useEffect(() => {
    if (!recipeForm.title) return;
    setRecipeForm((current) => {
      const autoSlug = generateSlug(recipeForm.title);
      if (!current.slug || current.slug === generateSlug(current.title)) {
        return { ...current, slug: autoSlug };
      }
      return current;
    });
  }, [recipeForm.title]);

  useEffect(() => {
    recipeFormRef.current = recipeForm;
  }, [recipeForm]);

  useEffect(() => {
    const autoTotal = computeTotalTime(recipeForm.prepTime, recipeForm.cookTime);
    if (autoTotal && autoTotal !== recipeForm.totalTime) {
      setRecipeForm((prev) => ({ ...prev, totalTime: autoTotal }));
    }
  }, [recipeForm.prepTime, recipeForm.cookTime, recipeForm.totalTime]);

  useEffect(() => {
    setRecipeImageDrafts((current) => {
      const next: Record<string, string> = {};
      adminRecipes.forEach((recipe) => {
        next[recipe.slug] = current[recipe.slug] ?? recipe.image ?? '';
      });
      return next;
    });
  }, [adminRecipes]);

  // Listen for "?edit=slug" parameter and load the recipe fields automatically
  useEffect(() => {
    if (adminRecipes.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const editSlug = params.get('edit');
    if (editSlug) {
      const targetRecipe = adminRecipes.find((recipe) => recipe.slug === editSlug);
      if (targetRecipe && editingSlug !== editSlug) {
        loadRecipeForEdit(targetRecipe);
      }
    }
  }, [adminRecipes, editingSlug]);

  function resetRecipeForm() {
    setRecipeForm(defaultForm);
    setEditingSlug('');
    setMessage('');
  }

  function loadRecipeForEdit(recipe: AdminRecipe) {
    setEditingSlug(recipe.slug);
    setRecipeForm({
      ...defaultForm,
      slug: recipe.slug,
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
      servings: recipe.servings || 2,
      rating: recipe.rating || 5,
      calories: recipe.calories || '',
      image: recipe.image || '',
      tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
      steps: Array.isArray(recipe.steps) ? recipe.steps.join('\n\n') : '',
      alcoholFree: Boolean(recipe.alcoholFree),
      containsAlcohol: Boolean(recipe.containsAlcohol),
      status: recipe.status || 'draft',
      sourceType: recipe.sourceType || '',
      licenseNote: recipe.licenseNote || '',
      foodSafetyNote: recipe.foodSafetyNote || '',
      editorialNote: recipe.editorialNote || '',
      historyStatus: recipe.historyStatus || '',
      featured: Boolean(recipe.featured),
    });
    setMessage('Loaded recipe for editing.');
  }

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

  async function saveSettings() {
    setSavingSettings(true);
    setSettingsMessage('');

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, apiKey }),
    });

    if (!res.ok) {
      setSettingsMessage('Unable to save settings.');
      setSavingSettings(false);
      return;
    }

    setSettingsMessage('AI settings saved successfully.');
    setSavingSettings(false);
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

  async function saveRecipe() {
    if (!recipeForm.title.trim()) {
      setMessage('Recipe title is required.');
      return;
    }

    setSaving(true);
    setMessage('');

    const payload = getPayload(recipeFormRef.current);

    const response = await fetch('/api/admin/recipes', {
      method: editingSlug ? 'PUT' : 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage(editingSlug ? 'Unable to update recipe.' : 'Unable to add recipe.');
      setSaving(false);
      return;
    }

    const data = await response.json();
    setAdminRecipes(Array.isArray(data) ? data : []);
    setMessage(editingSlug ? 'Recipe updated successfully.' : 'Recipe added successfully.');
    resetRecipeForm();
    setSaving(false);
  }

  async function downloadTemplate() {
    window.open('/api/admin/recipes/template', '_blank');
  }

  async function handleBulkImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkImporting(true);
    setBulkMessage('');
    setBulkFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/recipes/bulk', {
      method: 'POST',
      credentials: 'same-origin',
      body: formData,
    });

    const data = await response.json();
    setBulkImporting(false);

    if (!response.ok) {
      setBulkMessage(data.error || 'Bulk import failed.');
      return;
    }

    setBulkMessage(`Imported ${data.imported} recipes successfully. Total recipes now: ${data.total}.`);
    const recipeRes = await fetch('/api/admin/recipes', { cache: 'no-store', credentials: 'same-origin' });
    if (recipeRes.ok) {
      const recipeData = await recipeRes.json();
      setAdminRecipes(Array.isArray(recipeData) ? recipeData : []);
    }
    event.target.value = '';
  }

  async function refreshRecipes() {
    const recipeRes = await fetch('/api/admin/recipes', { cache: 'no-store', credentials: 'same-origin' });
    if (recipeRes.ok) {
      const recipeData = await recipeRes.json();
      setAdminRecipes(Array.isArray(recipeData) ? recipeData : []);
    }
  }

  async function publishAllVisibleRecipes() {
    const response = await fetch('/api/admin/recipes/bulk-actions', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish-all' }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Publish all failed.');
      return;
    }
    setMessage(data.message || 'All visible recipes published.');
    await refreshRecipes();
  }

  async function deleteRecipe(recipe: AdminRecipe) {
    const response = await fetch('/api/admin/recipes/bulk-actions', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-selected', slugs: [recipe.slug] }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Delete failed.');
      return;
    }
    setMessage(data.message || 'Recipe deleted.');
    await refreshRecipes();
  }

  async function applyBulkEdit() {
    if (!selectedRecipeSlugs.length) {
      setMessage('Select at least one recipe to bulk edit.');
      return;
    }
    const updates: Record<string, unknown> = {};
    if (bulkEditStatus) updates.status = bulkEditStatus;
    if (bulkEditCuisine) updates.cuisine = bulkEditCuisine;
    if (bulkEditMealType) updates.mealType = bulkEditMealType;
    updates.featured = bulkEditFeatured;

    const response = await fetch('/api/admin/recipes/bulk-actions', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk-edit', slugs: selectedRecipeSlugs, updates }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Bulk edit failed.');
      return;
    }
    setMessage(data.message || 'Bulk edit applied.');
    setSelectedRecipeSlugs([]);
    setBulkEditStatus('');
    setBulkEditCuisine('');
    setBulkEditMealType('');
    setBulkEditFeatured(false);
    await refreshRecipes();
  }

  async function updateRecipeStatus(recipe: AdminRecipe, status: string) {
    const updated = { ...recipe, status };
    try {
      const res = await fetch('/api/admin/recipes', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) return;
      const data = await res.json();
      setAdminRecipes(Array.isArray(data) ? data : adminRecipes);
    } catch {
      // ignore
    }
  }

  async function saveRecipeImage(recipe: AdminRecipe, overrideImageUrl?: string) {
    const draftImage = recipeImageDrafts[recipe.slug];
    const imageUrl = (overrideImageUrl ?? (typeof draftImage === 'string' ? draftImage : '')).trim();
    if (!recipe.slug) return;

    setSavingRecipeImageSlug(recipe.slug);
    try {
      const updatedRecipe = { ...recipe, image: imageUrl };
      const res = await fetch('/api/admin/recipes', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecipe),
      });

      if (!res.ok) {
        setMessage(`Unable to save image for ${recipe.title || recipe.slug}.`);
        return;
      }

      const data = await res.json();
      setAdminRecipes(Array.isArray(data) ? data : adminRecipes);
      setMessage(`Image saved for ${recipe.title || recipe.slug}.`);
    } catch {
      setMessage(`Unable to save image for ${recipe.title || recipe.slug}.`);
    } finally {
      setSavingRecipeImageSlug(null);
    }
  }

  async function uploadRecipeImageForRecipe(recipe: AdminRecipe, file: File) {
    if (!file) return;

    setSavingRecipeImageSlug(recipe.slug);
    setMessage(`Uploading image for ${recipe.title || recipe.slug}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

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
      const imageUrl = typeof data.url === 'string' ? data.url : '';
      if (!imageUrl) {
        throw new Error('Upload response did not include an image URL.');
      }

      setRecipeImageDrafts((current) => ({ ...current, [recipe.slug]: imageUrl }));
      await saveRecipeImage(recipe, imageUrl);
    } catch (err: any) {
      setMessage(err.message || `Unable to upload image for ${recipe.title || recipe.slug}.`);
    } finally {
      setSavingRecipeImageSlug(null);
    }
  }

  async function removeAllRecipes() {
    setIsDeletingAll(true);
    try {
      let response = await fetch('/api/admin/recipes', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        response = await fetch('/api/admin/recipes/bulk-actions', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete-selected', slugs: adminRecipes.map(r => r.slug).filter(Boolean) }),
        });
      }
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove recipes.');
      }
      setMessage('All recipes have been removed successfully.');
      await refreshRecipes();
      setShowDeleteConfirm(false);
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setIsDeletingAll(false);
    }
  }

  function handleLogout() {
    fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' }).finally(() => router.push('/admin/login'));
  }

  const filteredRecipes = useMemo(() => {
    const term = searchRecipeTerm.toLowerCase();
    return adminRecipes
      .filter((recipe) => {
        const matchesTerm = !term || [recipe.title, recipe.cuisine, recipe.mealType, recipe.slug].some((value) => String(value || '').toLowerCase().includes(term));
        const matchesStatus = statusFilter === 'All' || recipe.status === statusFilter;
        const matchesCuisine = cuisineFilter === 'All' || recipe.cuisine === cuisineFilter;
        const matchesMeal = mealFilter === 'All' || recipe.mealType === mealFilter;
        return matchesTerm && matchesStatus && matchesCuisine && matchesMeal;
      })
      .sort((a, b) => String(b.title).localeCompare(String(a.title)));
  }, [adminRecipes, searchRecipeTerm, statusFilter, cuisineFilter, mealFilter]);

  const summaryCounts = {
    total: adminRecipes.length,
    draft: adminRecipes.filter((recipe) => recipe.status === 'draft').length,
    published: adminRecipes.filter((recipe) => recipe.status === 'published').length,
    review: adminRecipes.filter((recipe) => recipe.status === 'pending review' || recipe.status === 'review required').length,
    archived: adminRecipes.filter((recipe) => recipe.status === 'archived').length,
  };

  return (
    <main className="min-h-screen bg-stone-100 p-10 text-stone-900 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-700 font-medium">Admin dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold text-stone-900">Manage recipes and AI settings</h1>
              <p className="mt-3 max-w-2xl text-sm text-stone-600">Use the section navigation below to jump between overview, recipe management, editing, imports, AI settings, and cleanup actions.</p>
            </div>
            <button onClick={handleLogout} className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">Logout</button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'recipes', label: 'Recipes' },
              { id: 'allRecipes', label: 'All Recipes' },
              { id: 'editor', label: 'Editor' },
              { id: 'import', label: 'Import' },
              { id: 'settings', label: 'AI Settings' },
              { id: 'danger', label: 'Danger Zone' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as typeof activeSection)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeSection === tab.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeSection === 'overview' && (
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Total recipes</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-900">{summaryCounts.total}</p>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Draft</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-900">{summaryCounts.draft}</p>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Published</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-900">{summaryCounts.published}</p>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Pending review</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-900">{summaryCounts.review}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Cuisines</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-900">{cuisines.length}</p>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Categories</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-900">{categories.length}</p>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Meal types</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-900">{mealTypes.length}</p>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Ingredients</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-900">{totalIngredients}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'recipes' && (
            <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">Recipe manager</h2>
                  <p className="mt-1 text-sm text-stone-600">Browse recipes, preview them in the public site, and change status quickly.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={publishAllVisibleRecipes} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Publish all</button>
                  <button type="button" onClick={() => setSelectedRecipeSlugs(filteredRecipes.map((recipe) => recipe.slug).filter(Boolean))} className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">Select all visible</button>
                  <button type="button" onClick={() => setSelectedRecipeSlugs([])} className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">Clear selection</button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <input value={searchRecipeTerm} onChange={(e) => setSearchRecipeTerm(e.target.value)} placeholder="Search recipes" className="rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm text-stone-700">
                  <option value="All">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="pending review">Pending review</option>
                  <option value="review required">Review required</option>
                  <option value="archived">Archived</option>
                </select>
                <select value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)} className="rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm text-stone-700">
                  <option value="All">All cuisines</option>
                  {cuisines.map((cuisine) => <option key={cuisine} value={cuisine}>{cuisine}</option>)}
                </select>
                <select value={mealFilter} onChange={(e) => setMealFilter(e.target.value)} className="rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm text-stone-700">
                  <option value="All">All meal types</option>
                  {mealTypes.map((meal) => <option key={meal} value={meal}>{meal}</option>)}
                </select>
              </div>

              <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">Bulk edit selected recipes</h3>
                    <p className="mt-1 text-sm text-stone-600">Apply common fields to all selected recipes in one click.</p>
                  </div>
                  <button type="button" onClick={applyBulkEdit} className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">Apply bulk edit</button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <select value={bulkEditStatus} onChange={(e) => setBulkEditStatus(e.target.value)} className="rounded-2xl border border-stone-300 bg-white p-3 text-sm text-stone-700">
                    <option value="">Keep status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending review">Pending review</option>
                    <option value="archived">Archived</option>
                  </select>
                  <input value={bulkEditCuisine} onChange={(e) => setBulkEditCuisine(e.target.value)} placeholder="Set cuisine" className="rounded-2xl border border-stone-300 bg-white p-3 text-sm" />
                  <input value={bulkEditMealType} onChange={(e) => setBulkEditMealType(e.target.value)} placeholder="Set meal type" className="rounded-2xl border border-stone-300 bg-white p-3 text-sm" />
                  <label className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-white p-3 text-sm text-stone-700">
                    <input type="checkbox" checked={bulkEditFeatured} onChange={(e) => setBulkEditFeatured(e.target.checked)} className="h-4 w-4 rounded border-stone-300 text-amber-600" />
                    Mark as featured
                  </label>
                </div>
                <p className="mt-2 text-xs text-stone-500">Selected recipes: {selectedRecipeSlugs.length || 0}</p>
              </div>

              <div className="mt-6 space-y-4">
                {filteredRecipes.length ? filteredRecipes.slice(0, 12).map((recipe) => (
                  <div key={recipe.slug} className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-700 font-medium">{recipe.cuisine || 'Global'}</p>
                        <h3 className="mt-2 text-lg font-semibold text-stone-900">{recipe.title || recipe.slug}</h3>
                        <p className="mt-2 text-sm text-stone-600">{recipe.mealType} · {recipe.foodType}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-700 shadow-sm">{recipe.status || 'draft'}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700">
                        <input type="checkbox" checked={selectedRecipeSlugs.includes(recipe.slug)} onChange={() => setSelectedRecipeSlugs((current) => current.includes(recipe.slug) ? current.filter((slug) => slug !== recipe.slug) : [...current, recipe.slug])} className="h-3.5 w-3.5 rounded border-stone-300 text-amber-600" />
                        Select
                      </label>
                      <button type="button" onClick={() => { setActiveSection('editor'); loadRecipeForEdit(recipe); }} className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100">Edit</button>
                      <button type="button" onClick={() => window.open(`/recipes/${recipe.slug}`, '_blank')} className="rounded-full border border-amber-600 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100">Preview</button>
                      {recipe.status !== 'published' ? (
                        <button type="button" onClick={() => updateRecipeStatus(recipe, 'published')} className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Publish</button>
                      ) : (
                        <button type="button" onClick={() => updateRecipeStatus(recipe, 'draft')} className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100">Unpublish</button>
                      )}
                      <button type="button" onClick={() => updateRecipeStatus(recipe, 'pending review')} className="rounded-full border border-amber-600 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100">Submit review</button>
                      <button type="button" onClick={() => deleteRecipe(recipe)} className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100">Delete</button>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">No recipes match these filters.</div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'allRecipes' && (
            <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">All recipes</h2>
                  <p className="mt-1 text-sm text-stone-600">Filter the full catalog and update recipe images one by one.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <input value={searchRecipeTerm} onChange={(e) => setSearchRecipeTerm(e.target.value)} placeholder="Search recipes" className="rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm text-stone-700">
                  <option value="All">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="pending review">Pending review</option>
                  <option value="review required">Review required</option>
                  <option value="archived">Archived</option>
                </select>
                <select value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)} className="rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm text-stone-700">
                  <option value="All">All cuisines</option>
                  {cuisines.map((cuisine) => <option key={cuisine} value={cuisine}>{cuisine}</option>)}
                </select>
                <select value={mealFilter} onChange={(e) => setMealFilter(e.target.value)} className="rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm text-stone-700">
                  <option value="All">All meal types</option>
                  {mealTypes.map((meal) => <option key={meal} value={meal}>{meal}</option>)}
                </select>
              </div>

              <div className="mt-6 space-y-4">
                {filteredRecipes.length ? filteredRecipes.map((recipe) => (
                  <div key={recipe.slug} className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-700 font-medium">{recipe.cuisine || 'Global'}</p>
                        <h3 className="mt-2 text-lg font-semibold text-stone-900">{recipe.title || recipe.slug}</h3>
                        <p className="mt-1 text-sm text-stone-600">{recipe.slug} · {recipe.status || 'draft'}</p>
                      </div>
                      <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[420px]">
                        <input
                          value={recipeImageDrafts[recipe.slug] ?? ''}
                          onChange={(e) => setRecipeImageDrafts((current) => ({ ...current, [recipe.slug]: e.target.value }))}
                          placeholder="Image URL"
                          className="rounded-2xl border border-stone-300 bg-white p-3 text-sm"
                        />
                        <label className="rounded-2xl border border-dashed border-stone-300 bg-white p-3 text-sm text-stone-700">
                          <span className="mb-2 block font-medium text-stone-900">Upload image file</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                void uploadRecipeImageForRecipe(recipe, file);
                              }
                              e.target.value = '';
                            }}
                            className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-2"
                          />
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveRecipeImage(recipe)}
                            disabled={savingRecipeImageSlug === recipe.slug}
                            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                          >
                            {savingRecipeImageSlug === recipe.slug ? 'Saving...' : 'Save image'}
                          </button>
                          {recipe.image ? (
                            <span className="text-xs text-stone-500">Current image set</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">No recipes match these filters.</div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'editor' && (
            <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">Recipe editor</h2>
                  <p className="mt-1 text-sm text-stone-600">Create or update recipes with one form.</p>
                </div>
                <button onClick={resetRecipeForm} className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">Reset form</button>
              </div>

              <div className="mt-5 grid gap-3">
                <input value={recipeForm.title} onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })} placeholder="Recipe title" className="rounded-2xl border border-stone-300 p-3" />
                <input value={recipeForm.slug} onChange={(e) => setRecipeForm({ ...recipeForm, slug: e.target.value })} placeholder="Slug" className="rounded-2xl border border-stone-300 p-3" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={recipeForm.cuisine} onChange={(e) => setRecipeForm({ ...recipeForm, cuisine: e.target.value })} placeholder="Cuisine" className="rounded-2xl border border-stone-300 p-3" />
                  <input value={recipeForm.country} onChange={(e) => setRecipeForm({ ...recipeForm, country: e.target.value })} placeholder="Country" className="rounded-2xl border border-stone-300 p-3" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={recipeForm.mealType} onChange={(e) => setRecipeForm({ ...recipeForm, mealType: e.target.value })} placeholder="Meal type" className="rounded-2xl border border-stone-300 p-3" />
                  <input value={recipeForm.foodType} onChange={(e) => setRecipeForm({ ...recipeForm, foodType: e.target.value })} placeholder="Category" className="rounded-2xl border border-stone-300 p-3" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={recipeForm.prepTime} onChange={(e) => setRecipeForm({ ...recipeForm, prepTime: e.target.value })} placeholder="Prep time" className="rounded-2xl border border-stone-300 p-3" />
                  <input value={recipeForm.cookTime} onChange={(e) => setRecipeForm({ ...recipeForm, cookTime: e.target.value })} placeholder="Cook time" className="rounded-2xl border border-stone-300 p-3" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={recipeForm.totalTime} onChange={(e) => setRecipeForm({ ...recipeForm, totalTime: e.target.value })} placeholder="Total time" className="rounded-2xl border border-stone-300 p-3" />
                  <input value={recipeForm.difficulty} onChange={(e) => setRecipeForm({ ...recipeForm, difficulty: e.target.value })} placeholder="Difficulty" className="rounded-2xl border border-stone-300 p-3" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="number" value={recipeForm.servings || ''} onChange={(e) => setRecipeForm({ ...recipeForm, servings: e.target.value === '' ? '' : Number(e.target.value) })} placeholder="Servings" className="rounded-2xl border border-stone-300 p-3" />
                  <input type="number" value={recipeForm.rating || ''} min="1" max="5" onChange={(e) => setRecipeForm({ ...recipeForm, rating: e.target.value === '' ? '' : Number(e.target.value) })} placeholder="Rating" className="rounded-2xl border border-stone-300 p-3" />
                </div>
                <input value={recipeForm.calories} onChange={(e) => setRecipeForm({ ...recipeForm, calories: e.target.value })} placeholder="Calories" className="rounded-2xl border border-stone-300 p-3" />
                <input value={recipeForm.tags} onChange={(e) => setRecipeForm({ ...recipeForm, tags: e.target.value })} placeholder="Tags (comma separated)" className="rounded-2xl border border-stone-300 p-3" />

                <label className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-700">
                  <span className="mb-2 block font-medium text-stone-900">Image URL</span>
                  <input
                    value={recipeForm.image}
                    onChange={(e) => setRecipeForm((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="Paste image URL or upload a file"
                    className="w-full rounded-2xl border border-stone-300 bg-white p-3"
                  />
                </label>
                <label className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-700">
                  <span className="mb-2 block font-medium text-stone-900">Upload image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full rounded-2xl border border-stone-300 bg-white p-3" />
                  <p className="mt-2 text-xs text-stone-500">This stores the image as a data URL for quick use in the recipe card.</p>
                </label>

                {recipeForm.image ? <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3"><img src={recipeForm.image} alt="Recipe preview" className="h-32 w-full rounded-xl object-cover" /></div> : null}

                <textarea value={recipeForm.description} onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })} placeholder="Short description" rows={3} className="rounded-2xl border border-stone-300 p-3" />
                <textarea value={recipeForm.history} onChange={(e) => setRecipeForm({ ...recipeForm, history: e.target.value })} placeholder="Recipe history" rows={4} className="rounded-2xl border border-stone-300 p-3" />
                <textarea value={recipeForm.ingredients} onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value })} placeholder="Ingredients (one per line)" rows={5} className="rounded-2xl border border-stone-300 p-3" />
                <textarea value={recipeForm.steps} onChange={(e) => setRecipeForm({ ...recipeForm, steps: e.target.value })} placeholder="Write each method step as a paragraph. Leave a blank line between steps to keep multi-line steps." rows={8} className="rounded-2xl border border-stone-300 p-3" />
                <textarea value={recipeForm.licenseNote} onChange={(e) => setRecipeForm({ ...recipeForm, licenseNote: e.target.value })} placeholder="License note" rows={2} className="rounded-2xl border border-stone-300 p-3" />
                <textarea value={recipeForm.foodSafetyNote} onChange={(e) => setRecipeForm({ ...recipeForm, foodSafetyNote: e.target.value })} placeholder="Food safety note" rows={2} className="rounded-2xl border border-stone-300 p-3" />
                <textarea value={recipeForm.editorialNote} onChange={(e) => setRecipeForm({ ...recipeForm, editorialNote: e.target.value })} placeholder="Editorial note" rows={2} className="rounded-2xl border border-stone-300 p-3" />

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm text-stone-700">
                    <input type="checkbox" checked={recipeForm.alcoholFree} onChange={(e) => setRecipeForm({ ...recipeForm, alcoholFree: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-600" />
                    Suitable without alcohol
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-stone-50 p-3 text-sm text-stone-700">
                    <input type="checkbox" checked={recipeForm.containsAlcohol} onChange={(e) => setRecipeForm({ ...recipeForm, containsAlcohol: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-600" />
                    Contains restricted ingredient
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="rounded-2xl border border-stone-300 p-3 text-sm text-stone-700">
                    <span className="block font-medium text-stone-900">Status</span>
                    <select value={recipeForm.status} onChange={(e) => setRecipeForm({ ...recipeForm, status: e.target.value })} className="mt-2 w-full rounded-2xl border border-stone-300 bg-white p-3 text-sm">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="pending review">Pending review</option>
                      <option value="review required">Review required</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                  <label className="rounded-2xl border border-stone-300 p-3 text-sm text-stone-700">
                    <span className="block font-medium text-stone-900">Featured</span>
                    <label className="mt-2 flex items-center gap-2 text-sm text-stone-700">
                      <input type="checkbox" checked={recipeForm.featured} onChange={(e) => setRecipeForm({ ...recipeForm, featured: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-600" />
                      Feature recipe
                    </label>
                  </label>
                </div>

                <button onClick={saveRecipe} disabled={saving} className="rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">{saving ? (editingSlug ? 'Saving…' : 'Adding…') : (editingSlug ? 'Save changes' : 'Save recipe')}</button>

                {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
              </div>
            </div>
          )}

          {activeSection === 'import' && (
            <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">Bulk recipe import</h2>
                  <p className="mt-1 text-sm text-stone-600">Download a sample sheet, fill in the required recipe fields, and upload it here.</p>
                </div>
                <button type="button" onClick={downloadTemplate} className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">Download sample sheet</button>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
                <label className="block text-sm text-stone-700">
                  <span className="mb-2 block font-medium text-stone-900">Upload filled Excel file</span>
                  <input type="file" accept=".xlsx,.xls" onChange={handleBulkImport} className="w-full rounded-2xl border border-stone-300 bg-white p-3" />
                </label>
                <p className="mt-2 text-xs text-stone-500">Required columns: title, slug, cuisine, country, mealType, foodType, description, history, prepTime, cookTime, totalTime, difficulty, servings, rating, calories, image, tags, ingredients, steps, alcoholFree, containsAlcohol, status, sourceType, licenseNote, foodSafetyNote, editorialNote, historyStatus, featured.</p>
                {bulkFileName ? <p className="mt-2 text-xs text-stone-600">Selected file: {bulkFileName}</p> : null}
                {bulkMessage ? <p className="mt-3 text-sm text-emerald-700">{bulkMessage}</p> : null}
                {bulkImporting ? <p className="mt-3 text-sm text-amber-700">Importing recipes…</p> : null}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-stone-900">AI settings</h2>
                  <p className="mt-1 text-sm text-stone-600">Update model configuration, prompt guidance, and API access for AI recipe help.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <label className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-stone-50 p-3">
                  <input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} className="h-4 w-4 rounded border-stone-300 text-amber-600" />
                  <span className="text-sm text-stone-700">AI features enabled</span>
                </label>

                <label className="block text-sm text-stone-700">
                  <span className="mb-2 block font-medium text-stone-900">Model</span>
                  <input value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} placeholder="Model name" className="mt-1 w-full rounded-2xl border border-stone-300 bg-white p-3" />
                </label>

                <label className="block text-sm text-stone-700">
                  <span className="mb-2 block font-medium text-stone-900">Pantry Chef System Prompt (Homepage AI)</span>
                  <textarea value={settings.systemPrompt} onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })} placeholder="Instructions for the homepage ingredient assistant" rows={3} className="mt-1 w-full rounded-2xl border border-stone-300 bg-white p-3" />
                </label>

                <label className="block text-sm text-stone-700">
                  <span className="mb-2 block font-medium text-stone-900">Recipe Modifier System Prompt (Modify AI Page)</span>
                  <textarea value={settings.systemPromptModify} onChange={(e) => setSettings({ ...settings, systemPromptModify: e.target.value })} placeholder="Instructions for the scaling and substitutions assistant" rows={3} className="mt-1 w-full rounded-2xl border border-stone-300 bg-white p-3" />
                </label>

                <label className="block text-sm text-stone-700">
                  <span className="mb-2 block font-medium text-stone-900">API key</span>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste API key" className="mt-1 w-full rounded-2xl border border-stone-300 bg-white p-3" />
                </label>

                <button onClick={saveSettings} disabled={savingSettings} className="rounded-full bg-slate-700 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{savingSettings ? 'Saving settings…' : 'Save AI settings'}</button>
                {settingsMessage ? <p className="text-sm text-emerald-700">{settingsMessage}</p> : null}
              </div>
            </div>
          )}

          {activeSection === 'danger' && (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
                  <p className="mt-1 text-sm text-red-700">Irreversible administrative actions.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <p className="text-xs text-red-650 leading-relaxed">
                  Clicking below will permanently remove all recipes from the backend database and reset the frontend list.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-all hover:shadow-lg focus:outline-none"
                  >
                    Remove All Recipes Everywhere
                  </button>
                ) : (
                  <div className="space-y-3 p-4 bg-white border border-red-200 rounded-2xl">
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                      ⚠️ Are you absolutely sure? This cannot be undone!
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={removeAllRecipes}
                        disabled={isDeletingAll}
                        className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-850 text-white rounded-xl font-bold text-xs disabled:opacity-50 transition-all focus:outline-none"
                      >
                        {isDeletingAll ? 'Erasing...' : 'Yes, Delete All'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-stone-200 text-stone-700 rounded-xl font-bold text-xs hover:bg-stone-300 transition-all focus:outline-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}