export type FilterOption = {
  value: string;
  label: string;
};
export const FILTER_KEYS = ["department", "company", "status", "loanStatus"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

export type EmployeeFilterOptions = Partial<
  Record<FilterKey, FilterOption[]>
>;
