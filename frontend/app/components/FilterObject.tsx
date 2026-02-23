"use client";

import { X } from "lucide-react";
import { useFilters } from "./FilterContext";

export default function ActiveFilters() {
  const { filters, removeFilter, clearAll } = useFilters();

  const hasFilters =
    Object.values(filters).flat().length > 0;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-x-3 mt-4 items-center">
      <span className="text-sm font-medium">Filters</span>

      {Object.entries(filters).map(([key, values]) =>
        values.map((value) => (
          <span
            key={`${key}-${value}`}
            className="flex items-center gap-2 bg-mainBg text-white px-3 py-1 rounded-full"
          >
            {value}
            <button onClick={() => removeFilter(key, value)}>
              <X size={14} />
            </button>
          </span>
        ))
      )}

      <button
        onClick={clearAll}
        className="text-sm font-bold underline ml-2"
      >
        Clear all
      </button>
    </div>
  );
}
