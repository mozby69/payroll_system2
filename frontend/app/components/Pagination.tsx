import React from "react";

function getPaginationRange(
  current: number,
  total: number,
  delta = 2
): (number | "...")[] {
  if (total <= 1) return [1];

  // If small total pages, show everything
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range: (number | "...")[] = [];

  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  // Always include first page
  if (left > 1) {
    range.push(1);
  }

  // Add left dots
  if (left > 2) {
    range.push("...");
  }

  // Middle pages
  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  // Add right dots
  if (right < total - 1) {
    range.push("...");
  }

  // Always include last page
  if (right < total) {
    range.push(total);
  }

  return range;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (!totalPages || totalPages <= 0) return null;

  const safePage = Math.min(Math.max(page, 1), totalPages);

  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  const pages = getPaginationRange(safePage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-white border-t border-gray-200">
      {/* Showing X-Y of Z entries */}
      <div className="text-sm text-gray-700">
        Showing{" "}
        <span className="font-semibold text-gray-900">{start}</span> to{" "}
        <span className="font-semibold text-gray-900">{end}</span> of{" "}
        <span className="font-semibold text-gray-900">{totalItems}</span>{" "}
        entries
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          disabled={safePage === 1}
          onClick={() => safePage > 1 && onPageChange(safePage - 1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        {/* Desktop Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, idx) =>
            p === "..." ? (
              <span
                key={`dots-${idx}`}
                className="px-3 py-2 text-gray-500 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-10 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  safePage === p
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Mobile View */}
        <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
          Page {safePage} of {totalPages}
        </div>

        {/* Next */}
        <button
          disabled={safePage === totalPages}
          onClick={() => safePage < totalPages && onPageChange(safePage + 1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}