"use client";

import dynamic from "next/dynamic";
import "flatpickr/dist/flatpickr.min.css";
import { useState,useRef,useEffect } from "react";
import { DateRange } from "../types/utilsTypes";

const Flatpickr = dynamic(() => import("react-flatpickr"), {
  ssr: false,
});

// Format PH date (YYYY-MM-DD)
const formatPHDate = (date: Date) =>
  date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila",
  });



interface DateRangePickerProps {
  value?: Date[];
  onChange?: (range: DateRange) => void;
  disabledRanges?: { from: Date; to: Date }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function DateRangePicker({
  value = [],
  onChange,
  placeholder = "Select date range",
  className = "",
  disabledRanges = [],
  disabled = false,
}: DateRangePickerProps) {
  const [range, setRange] = useState<Date[]>(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);


  return (
    <div ref={containerRef} className={`relative w-4/12 ${className}`}>
      {/* Input */}
      <input
        readOnly
        disabled={disabled}
        value={
          range.length === 2
            ? `${formatPHDate(range[0])} to ${formatPHDate(range[1])}`
            : ""
        }
        //onClick={() => setOpen(true)}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}

        placeholder={placeholder}
        className={`border border-slate-300 px-3 py-2.5 rounded w-full 
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer bg-white"}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
      />

      {/* Calendar */}
      {open && (
        <div className="absolute z-50 mt-2 bg-white shadow-lg rounded">
          <Flatpickr
            value={range}
            onChange={(dates) => {
              setRange(dates);

              if (dates.length === 2) {
                const payload = {
                  startDate: formatPHDate(dates[0]),
                  endDate: formatPHDate(dates[1]),
                };

                onChange?.(payload);
                setOpen(false);
              }
            }}
            options={{
              mode: "range",
              dateFormat: "Y-m-d",
              showMonths: 2,
              inline: true,
              disable: disabledRanges,
            }}
          />
        </div>
      )}
    </div>
  );
}
