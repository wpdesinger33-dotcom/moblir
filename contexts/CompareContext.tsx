"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "compare_slugs";

interface CompareContextType {
  slugs: string[];
  toggle: (slug: string) => void;
  clear: () => void;
  isSelected: (slug: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextType>({
  slugs: [], toggle: () => {}, clear: () => {}, isSelected: () => false, isFull: false,
});

export function CompareProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSlugs(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length < MAX_COMPARE
          ? [...prev, slug]
          : prev; // full
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSlugs([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isSelected = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const isFull     = slugs.length >= MAX_COMPARE;

  return (
    <CompareContext.Provider value={{ slugs, toggle, clear, isSelected, isFull }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
