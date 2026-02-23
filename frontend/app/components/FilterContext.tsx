"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { useQueryFilters } from "../hooks/useQueryFilter";

type BaseFilterContext = {
  filters: Record<string, string[]>;
  toggleFilter: (key: string, value: string) => void;
  removeFilter: (key: string, value: string) => void;
  clearAll: () => void;
  filterKeys: readonly string[];
};

const FilterContext = createContext<BaseFilterContext | null>(null);

export function FilterProvider<const T extends readonly string[]>({
  children,
  filterKeys,
}: {
  children: ReactNode;
  filterKeys: T;
}) {
  const filterLogic = useQueryFilters(filterKeys);

  const value = useMemo<BaseFilterContext>(
    () => ({
      ...filterLogic,
      filterKeys,
    }),
    [filterLogic, filterKeys]
  );

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilters must be used inside FilterProvider");
  }
  return ctx;
}
