"use client";

import {
  forwardRef,
  SelectHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      error,
      className = "",
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target;

        if (!(target instanceof Node)) {
          return;
        }

        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );
      };
    }, []);

    return (
      <div className="w-full">
        <div
          ref={wrapperRef}
          className="relative"
        >
          <select
            ref={ref}
            id={id}
            className={`
              h-11
              w-full
              appearance-none
              rounded-md
              border
              bg-white
              pl-3
              pr-8
              text-sm
              text-slate-700
              outline-none
              cursor-pointer
              transition-all
              duration-200

              ${
                error
                  ? `
                    border-red-400
                    focus:border-red-500
                    focus:ring-2
                    focus:ring-red-500/20
                  `
                  : `
                    border-slate-300
                    hover:border-slate-400
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                  `
              }

              disabled:cursor-not-allowed
              disabled:bg-slate-100
              disabled:text-slate-400

              ${className}
            `}
            onMouseDown={() => {
              setIsOpen((prev) => !prev);
            }}
            onFocus={(event) => {
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsOpen(false);
              onBlur?.(event);
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <svg
            className={`
              pointer-events-none
              absolute
              right-3
              top-1/2
              size-6
              -translate-y-1/2
              text-slate-700
              transition-transform
              duration-400
              ease-in-out

              ${isOpen ? "rotate-180" : "rotate-0"}
            `}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;