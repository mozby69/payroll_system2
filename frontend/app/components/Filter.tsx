"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  filters: any;
  setFilters: any;
};

const options = {
  department: ["HR", "IT", "Finance"],
  company: ["EMB", "FCH", "RFC"],
  status: ["Regular", "Probationary"],
};

export default function FilterModal({
  open,
  onClose,
  filters,
  setFilters,
}: Props) {
  if (!open) return null;

  const toggle = (key: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v: string) => v !== value)
        : [...prev[key], value],
    }));
  };

  return (
    <div className="fixed top-14 right-4 bottom-0 z-50 shadow-[0px_0px_6px_4px_rgba(0,0,0,0.1)] flex justify-end cursor-pointer">
      <div className="w-full max-w-md bg-mainLight h-full p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 ">
          <h2 className="font-bold text-lg">Filters</h2>
          <button onClick={onClose} className="cursor-pointer hover:scale-[1.3] transition duration-75 ease-in-out"> <X/> </button>
        </div>

        {Object.entries(options).map(([key, values]) => (
          <div key={key} className="mb-6 ">
            <h3 className="font-semibold capitalize mb-2 ">{key}</h3>

            <div className="flex flex-wrap gap-2">
              {values.map((value) => (
                <button
                  key={value}
                  onClick={() => toggle(key, value)}
                  className={`px-3 py-1 rounded-2xl border text-sm hover:scale-[1.05] cursor-pointer transition duration-75 ease-in-out
                    ${
                      filters[key].includes(value)
                        ? "bg-mainhighlight text-white"
                        : "bg-white text-mainhighlight"
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={onClose}
          className="w-full bg-mainhighlight text-white py-2 rounded-md mt-6"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}


