"use client";

import { X } from "lucide-react";
import {useEmployeeFilters} from "../hooks/Filters"

type Props = {
  open: boolean;
  onClose: () => void;
  filters: Record<string,string[]>;
  onToggle: (key:string,value:string) => void;
};


export default function FilterModal({
  open,
  onClose,
  filters,
  onToggle,
}: Props) {
  const { data, isLoading } = useEmployeeFilters();
  if (!open) return null;
  if (isLoading) return <div className="p-6">Loading filters...</div>;

  return (
    <div className="fixed top-14 right-4 bottom-0 z-50 shadow-[0px_0px_6px_4px_rgba(0,0,0,0.1)] flex justify-end cursor-pointer">
      <div className="w-full max-w-md bg-mainLight h-full p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 ">
          <h2 className="font-bold text-lg">Filters</h2>
          <button onClick={onClose} className="cursor-pointer hover:scale-[1.3] transition duration-75 ease-in-out"> <X/> </button>
        </div>


        {Object.entries(data!).map(([key, values]) => (
          <div key={key} className="mb-6">
            <h3 className="font-semibold capitalize mb-2">{key}</h3>

            <div className="flex flex-wrap gap-2">
              {values.map(({ value, label }) => {
                  const selectedValues = filters[key] ?? [];
                  const isActive = selectedValues.includes(value);

                  return (
                    <button
                      key={value}
                      onClick={() => onToggle(key, value)}
                      className={`px-3 py-1 rounded-2xl border text-sm transition hover:scale-[1.05] cursor-pointer
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
        ))}


        <button
          onClick={onClose}
          className="w-full bg-mainhighlight text-white py-2 rounded-md mt-6"
        >
          Done Filter
        </button>
      </div>
    </div>
  );
}


