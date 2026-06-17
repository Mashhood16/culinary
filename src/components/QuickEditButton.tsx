'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface QuickEditButtonProps {
  slug: string;
}

export default function QuickEditButton({ slug }: QuickEditButtonProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Flag to ensure code only executes on the client browser
    setMounted(true);
    
    async function checkAdminSession() {
      try {
        // Silently query your admin settings endpoint with credentials
        const res = await fetch('/api/admin/settings', { 
          cache: 'no-store', 
          credentials: 'same-origin' 
        });
        if (res.ok) {
          setIsAdmin(true);
        }
      } catch {
        setIsAdmin(false);
      }
    }
    
    checkAdminSession();
  }, []);

  // Securely hides the button from both SSR compilation and normal public visitors
  if (!mounted || !isAdmin) return null;

  return (
    <Link
      href={`/admin/edit?recipe=${slug}`}
      className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 hover:-translate-y-0.5"
    >
      ✏️ Edit Recipe Directly
    </Link>
  );
}