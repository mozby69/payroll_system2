export type FilterOption = {
  value: string;
  label: string;
};

export type EmployeeFilterOptions = {
  department: FilterOption[];
  company: FilterOption[];
  status: FilterOption[];
};
