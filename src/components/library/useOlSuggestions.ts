"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicBook } from "@/lib/openlibrary";

export function useOlSuggestions(query: string, minLen = 2, limit = 8) {
  const [suggestions, setSuggestions] = useState<PublicBook[]>([]);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < minLen) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const id = ++reqId.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/library/search?q=${encodeURIComponent(q)}&limit=${limit}`);
        const data = await res.json();
        if (id !== reqId.current) return;
        setSuggestions(Array.isArray(data.results) ? data.results : []);
      } catch {
        if (id === reqId.current) setSuggestions([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, minLen, limit]);

  return { suggestions, loading };
}
