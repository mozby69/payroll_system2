"use client";

import { X } from "lucide-react";

type Filters = Record<string, string[]>;

type Props<T extends Filters> = {
  filters: T;
  onRemove: (key: keyof T, value: string) => void;
  onClearAll: () => void;
};

export default function ActiveFilters<T extends Filters>({
  filters,
  onRemove,
  onClearAll,
}: Props<T>) {
  const hasFilters = Object.values(filters).flat().length > 0;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-x-3 mt-4 items-center">
      <span className="text-sm font-medium">Filters</span>

      {Object.entries(filters).map(([key, values]) =>
        values.map((value) => (
          <span
            key={`${key}-${value}`}
            className="flex items-center gap-2 bg-mainBg text-white px-3 py-1 rounded-full text-md"
          >
            {value}
            <button onClick={() => onRemove(key as keyof T, value)}>
              <X size={14} />
            </button>
          </span>
        ))
      )}

      <button
        onClick={onClearAll}
        className="text-sm font-bold text-mainBg underline ml-2"
      >
        Clear all
      </button>
    </div>
  );
}
