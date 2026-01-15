import { Column, EmployeeRow } from "@/app/types/preparePayroll";
import Datatable from "../Datatable";
import { Pagination } from "../Pagination";


const PAGE_SIZE = 6;


interface Props {
  data: EmployeeRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  onNext: () => void;
}


const columns: Column<EmployeeRow>[] = [
  {
    header: "Employee",
    render: (row) =>
      `${row.Lastname}, ${row.Firstname}`,
  },
  {
    header:"Emp Code",
    accessor: (row) => row.EmpCode,
  },
  {
    header:"Branch",
    render: (row) =>
      `${row.BranchCode?.branchCode}`,
  },
  {
    header:"Basic Pay",
    accessor: (row) => row.basic_salary,
  }
]

export default function StepConfirmEmployees({
  data,
  meta,
  search,
  onSearchChange,
  page,
  onPageChange,
  onNext,
}: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">
        Confirm Employee Details
      </h2>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
      />

      <Datatable columns={columns} data={data} />

      <Pagination
        page={page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        pageSize={PAGE_SIZE}
        onPageChange={onPageChange}
      />

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
}