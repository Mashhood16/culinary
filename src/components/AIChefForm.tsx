'use client';

import { useState, useEffect } from 'react';

// Zero-dependency inline Markdown-to-React parser
function parseMarkdownToReact(text: string) {
  if (!text) return null;

  const lines = text.split('\n');
  let inList = false;
  let inOrderedList = false;
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  function parseInlineMarkdown(str: string) {
    const parts = [];
    let index = 0;
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > index) {
        parts.push(str.substring(index, match.index));
      }
      if (match[1]) {
        parts.push(
          <strong key={match.index} className="font-semibold text-stone-955 dark:text-white">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(
          <em key={match.index} className="italic text-stone-800 dark:text-stone-200">
            {match[4]}
          </em>
        );
      }
      index = regex.lastIndex;
    }
    if (index < str.length) {
      parts.push(str.substring(index));
    }
    return parts.length > 0 ? parts : str;
  }

  function flushList() {
    if (inList) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-4 space-y-1.5 text-stone-700 dark:text-stone-300">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
    if (inOrderedList) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal pl-5 my-4 space-y-1.5 text-stone-700 dark:text-stone-300">
          {listItems}
        </ol>
      );
      listItems = [];
      inOrderedList = false;
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={idx} className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-6 mb-3">
          {parseInlineMarkdown(trimmed.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={idx} className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-5 mb-2">
          {parseInlineMarkdown(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={idx} className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-4 mb-2">
          {parseInlineMarkdown(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inOrderedList) flushList();
      inList = true;
      listItems.push(
        <li key={idx} className="text-stone-700 dark:text-stone-300 pl-1 leading-relaxed">
          {parseInlineMarkdown(trimmed.substring(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (inList) flushList();
      inOrderedList = true;
      const match = trimmed.match(/^\d+\.\s(.*)/);
      const content = match ? match[1] : trimmed;
      listItems.push(
        <li key={idx} className="text-stone-700 dark:text-stone-300 pl-1 leading-relaxed">
          {parseInlineMarkdown(content)}
        </li>
      );
    } else if (trimmed === '') {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={idx} className="my-2.5 leading-relaxed text-stone-700 dark:text-stone-300">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

export default function AIChefForm() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleAskAI() {
    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt || 'Suggest 3 recipes I can make with common pantry ingredients and explain substitutions.',
          type: 'pantry' // Securely triggers your "Pantry Chef" system prompt instructions
        }),
      });
      const data = await response.json();
      setAnswer(data.answer || 'No answer returned.');
    } catch {
      setAnswer('AI assistance is currently unavailable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="glass-card rounded-[32px] p-6 border border-stone-200/80 bg-white shadow-sm dark:border-stone-850 dark:bg-stone-900/95 font-sans">
      <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Cook with what you have</h2>
      <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">Type ingredients you already have, then ask the AI Food Scientist for recipe ideas and substitutions.</p>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        className="mt-4 w-full rounded-2xl border border-stone-300 bg-stone-50 p-4 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
        placeholder="Try: chicken, tomato, yogurt, rice, vegetarian, dairy-free..."
      />
      
      <button
        onClick={handleAskAI}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-400"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing pantry...
          </>
        ) : 'Ask AI Scientist'}
      </button>

      <div className="mt-5 rounded-2xl border-l-4 border-amber-600 bg-amber-50/10 p-5 dark:bg-stone-950/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-amber-800 dark:text-amber-500">
          <svg className={`h-4 w-4 text-amber-600 ${loading ? 'animate-bounce' : 'animate-pulse'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm12 7a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1zM11 5a1 1 0 01.1.002l1 1a1 1 0 010 1.414l-1 1A1 1 0 0110 8V5zm-4 9a1 1 0 011-1h1a1 1 0 110 2H8v1a1 1 0 11-2 0v-1z" />
          </svg>
          <span>AI Food Scientist Suggestion</span>
        </div>

        {loading ? (
          <div className="mt-4 space-y-3 animate-pulse">
            <div className="h-4 bg-stone-200/80 dark:bg-stone-700/80 rounded w-3/4"></div>
            <div className="h-4 bg-stone-200/80 dark:bg-stone-700/80 rounded w-5/6"></div>
            <div className="h-4 bg-stone-200/80 dark:bg-stone-700/80 rounded w-2/3"></div>
          </div>
        ) : (
          <div className="mt-2 text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
            {mounted ? (
              parseMarkdownToReact(answer) || (
                <p className="text-stone-500 dark:text-stone-400">
                  Enter ingredients or dietary needs to get recipe ideas from the AI helper.
                </p>
              )
            ) : (
              <p className="text-stone-500 animate-pulse">Loading...</p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}