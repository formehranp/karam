import React, { useState } from 'react';
import { Search, X, ArrowUpLeft } from 'lucide-react';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // Check if user entered a full URL or domain
    const isUrl =
      /^https?:\/\//i.test(trimmed) ||
      /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed);

    if (isUrl) {
      const destination = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      window.location.href = destination;
    } else {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-2xl mx-auto my-3 relative group"
    >
      <div className="flex items-center w-full px-5 py-3.5 rounded-full bg-m3-surface-container-high border border-transparent focus-within:border-m3-primary/40 focus-within:bg-m3-surface-container-lowest focus-within:shadow-m3-2 transition-all duration-200">
        <div className="flex items-center justify-center pl-3 text-m3-on-surface-variant group-focus-within:text-m3-primary transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در گوگل یا وارد کردن نشانی اینترنتی..."
          className="w-full bg-transparent border-none outline-none text-m3-on-surface placeholder-m3-on-surface-variant/70 text-sm md:text-base font-medium"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1 rounded-full text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-highest transition-colors mr-1"
            title="پاک کردن"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="p-2 mr-1 rounded-full bg-m3-primary text-m3-on-primary hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center"
          title="جستجو"
          aria-label="جستجو"
        >
          <ArrowUpLeft className="w-4 h-4 rotate-45" />
        </button>
      </div>
    </form>
  );
};
