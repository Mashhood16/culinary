'use client';

import { useState, useEffect, useRef } from 'react';

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChefForm() {
  const [prompt, setPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, loading]);

  async function handleAskAI() {
    setLoading(true);
    const userMessage = prompt || 'Suggest 3 recipes I can make with common pantry ingredients and explain substitutions.';
    
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(newMessages);
    setShowModal(true);
    setPrompt('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage,
          type: 'pantry'
        }),
      });
      const data = await response.json();
      setChatMessages([...newMessages, { role: 'assistant', content: data.answer || 'No answer returned.' }]);
    } catch {
      setChatMessages([...newMessages, { role: 'assistant', content: 'AI assistance is currently unavailable. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleContinueChat() {
    if (!chatInput.trim()) return;
    
    setLoading(true);
    const userMessage = chatInput;
    // Capture history before adding the new message so the API gets the correct prior context
    const priorMessages = [...chatMessages];
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(newMessages);
    setChatInput('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage,
          type: 'pantry',
          history: priorMessages
        }),
      });
      const data = await response.json();
      setChatMessages([...newMessages, { role: 'assistant', content: data.answer || 'No answer returned.' }]);
    } catch {
      setChatMessages([...newMessages, { role: 'assistant', content: 'AI assistance is currently unavailable. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setChatMessages([]);
    setChatInput('');
  }

  return (
    <>
      <article className="glass-card rounded-[32px] p-6 bg-white shadow-sm dark:bg-stone-900/95 font-sans border-none">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Cook with what you have</h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">Enter ingredients you already have on hand, and the AI Food Scientist will suggest recipes you can make, with step-by-step instructions and smart substitutions.</p>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="mt-4 w-full rounded-2xl border border-stone-300 bg-stone-50 p-4 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          placeholder="e.g. chicken breast, rice, garlic, soy sauce, broccoli - or add dietary needs like gluten-free, vegan..."
        />
        
        <button
          onClick={handleAskAI}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {loading && chatMessages.length === 0 ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Finding recipes...
            </>
          ) : 'Find Recipes'}
        </button>

        {chatMessages.length === 0 && (
          <div className="mt-5 rounded-2xl border-l-4 border-amber-600 bg-amber-50/10 p-5 dark:bg-stone-950/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-amber-800 dark:text-amber-500">
              <svg className="h-4 w-4 text-amber-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm12 7a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1zM11 5a1 1 0 01.1.002l1 1a1 1 0 010 1.414l-1 1A1 1 0 0110 8V5zm-4 9a1 1 0 011-1h1a1 1 0 110 2H8v1a1 1 0 11-2 0v-1z" />
              </svg>
              <span>AI Food Scientist</span>
            </div>
            <div className="mt-2 text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
              {mounted ? (
                <p className="text-stone-500 dark:text-stone-400">
                  List your ingredients above and I{"'"}ll suggest recipes you can make right now, with substitutions and cooking tips.
                </p>
              ) : (
                <p className="text-stone-500 animate-pulse">Loading...</p>
              )}
            </div>
          </div>
        )}
      </article>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}>
          <div 
            className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm12 7a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1zM11 5a1 1 0 01.1.002l1 1a1 1 0 010 1.414l-1 1A1 1 0 0110 8V5zm-4 9a1 1 0 011-1h1a1 1 0 110 2H8v1a1 1 0 11-2 0v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">AI Food Scientist</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Ask about recipes, substitutions, and cooking tips</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition"
              >
                <svg className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed">
                        {parseMarkdownToReact(message.content)}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleContinueChat();
                    }
                  }}
                  placeholder="Continue the conversation..."
                  className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-500 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 dark:placeholder-stone-400"
                />
                <button
                  onClick={handleContinueChat}
                  disabled={loading || !chatInput.trim()}
                  className="p-2.5 rounded-full bg-amber-600 text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 text-center">Press Enter to send</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}