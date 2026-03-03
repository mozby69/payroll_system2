"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useQueryFilters<const T extends readonly string[]>(
  filterKeys: T
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  type FilterKey = T[number];

  const filters = useMemo(() => {
    const result = {} as Record<FilterKey, string[]>;

    for (const key of filterKeys as readonly FilterKey[]) {
        result[key] = searchParams.getAll(key);
    }

    return result;
    }, [searchParams, filterKeys]);


  const updateParams = (fn: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    fn(params);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const toggleFilter = (key: FilterKey, value: string) => {
    updateParams((params) => {
      const values = params.getAll(key);

      params.delete(key);

      if (!values.includes(value)) {
        [...values, value].forEach((v) => params.append(key, v));
      } else {
        values
          .filter((v) => v !== value)
          .forEach((v) => params.append(key, v));
      }

      params.set("page", "1");
    });
  };

  const removeFilter = (key: FilterKey, value: string) => {
    updateParams((params) => {
      const values = params.getAll(key).filter((v) => v !== value);
      params.delete(key);
      values.forEach((v) => params.append(key, v));
    });
  };

  const clearAll = () => {
    updateParams((params) => {
      for (const key of filterKeys) {
        params.delete(key);
      }
      params.set("page", "1");
    });
  };

  return {
    filters,
    toggleFilter,
    removeFilter,
    clearAll,
  };
}
