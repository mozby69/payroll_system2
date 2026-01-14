"use client";

import dynamic from "next/dynamic";
import "flatpickr/dist/flatpickr.min.css";
import { useState } from "react";
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
  placeholder?: string;
  className?: string;
}

export default function DateRangePicker({
  value = [],
  onChange,
  placeholder = "Select date range",
  className = "",
}: DateRangePickerProps) {
  const [range, setRange] = useState<Date[]>(value);
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Input */}
      <input
        readOnly
        value={
          range.length === 2
            ? `${formatPHDate(range[0])} to ${formatPHDate(range[1])}`
            : ""
        }
        onClick={() => setOpen(true)}
        placeholder={placeholder}
        className="border px-3 py-2 rounded w-full cursor-pointer bg-white"
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
            }}
          />
        </div>
      )}
    </div>
  );
}
