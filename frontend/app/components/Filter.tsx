"use client";

import { X } from "lucide-react";
import { useEmployeeFilters } from "../hooks/Filters";
import { useEffect } from "react";
import { useFilters } from "./FilterContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FilterModal({ open, onClose }: Props) {
  const { filters, toggleFilter, filterKeys } = useFilters();
  const { data, isLoading } = useEmployeeFilters();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  if (!open) return null;
  if (isLoading) return <div className="p-6">Loading filters...</div>;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      <div
        className="absolute top-0 right-4 bottom-0 w-full max-w-md
        bg-mainLight shadow p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">Filters</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {Object.entries(data ?? {})
          .filter(([key]) => filterKeys.includes(key))
          .map(([key, values]) => {
            const selectedValues = filters[key] ?? [];

            return (
              <div key={key} className="mb-6">
                <h3 className="font-semibold capitalize mb-2">
                  {key}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {values.map(({ value, label }) => {
                    const isActive =
                      selectedValues.includes(value);

                    return (
                      <button
                        key={value}
                        onClick={() =>
                          toggleFilter(key, value)
                        }
                        className={`px-3 py-1 rounded-2xl border text-sm transition hover:bg-mainhighlight hover:text-white cursor-pointer
                          ${
                            isActive
                              ? "bg-mainhighlight text-white"
                              : "bg-white text-mainhighlight"
                          }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
