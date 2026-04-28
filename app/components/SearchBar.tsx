"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto">
      <div className="relative flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari judul komik..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm"
        />
      </div>
      <button
        type="submit"
        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm whitespace-nowrap"
      >
        Cari
      </button>
    </form>
  );
}
