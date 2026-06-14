'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@globalrecipehub.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Login failed');
      setLoading(false);
      return;
    }

    router.push('/admin');
  }

  return (
    <main className="min-h-screen bg-stone-100 p-10 text-stone-900">
      <div className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Admin Access</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in to manage AI settings</h1>
        <p className="mt-3 text-stone-600">Use the admin credentials to update your AI configuration.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
          </label>
          <label className="block text-sm font-medium">Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-2xl border border-stone-300 p-3" />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button disabled={loading} className="w-full rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </main>
  );
}
