import DateRangePicker from "@/app/ui/DateRangePicker";
import SweetAlert from "../Swal";
import { useEffect, useState } from "react";
import { DateRange } from "@/app/types/utilsTypes";
import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay";
import { Column } from "@/app/types/preparePayroll";
import Datatable from "../Datatable";
import { useComputedPayroll } from "@/app/hooks/usePreparePayroll";
import { useDebounce } from "@/app/utils/useDebounce";
import { ComputedProps } from "@/app/services/preparePayroll";
import { Pagination } from "../Pagination";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useDisabledPayrollDates } from "@/app/hooks/useApiProcess";
import { normalizeDisabledRanges } from "@/app/helper/flatPickerHelper";


interface Props {
  range: DateRange | null;
  setRange: (range: DateRange) => void;
  cycle: string;
    onBack: () => void;
    onNext: () => void;
  }


  
  
  export default function StepComputePayroll({ onBack, onNext,range,setRange,cycle }: Props) {
      const PAGE_SIZE = 7;
      const [page, setPage] = useState(1);
      const [search, setSearch] = useState("");
      const debouncedSearch = useDebounce(search, 400);
      const [showProcessing, setShowProcessing] = useState(false);

      const payrollPeriod = range ? `${range.startDate} to ${range.endDate}` : null;
      const queryClient = useQueryClient();
      const { data: disabledRanges = [] } = useDisabledPayrollDates(cycle);

     
      const flatpickrDisabled = normalizeDisabledRanges(disabledRanges);

      const { data: employee_payroll } = useComputedPayroll({
          cycle,
          page,
          limit: 6,
          search: debouncedSearch,
          range,
        });

      const tableData: ComputedProps[] = employee_payroll?.data ?? [];

      const columns: Column<ComputedProps>[] = [
        {
          header: "Employee",
          render: (row) =>
            `${row.EmpCode.Firstname}, ${row.EmpCode.Lastname}`,
        },
        {
          header:"PayCode",
          accessor: (row) => row.PayCode,
        },
        {
          header:"EMPCODE",
          accessor: (row) => row.EmpCodeId,
        },
        {
          header:"LATE",
          accessor: (row) => row.late_count,
        },
        {
          header:"ABSENCE",
          accessor: (row) => row.absence_count,
        },
        {
          header:"OVERTIME",
          accessor: (row) => row.overtime,
        },
        {
          header:"GROSS PAY",
          accessor: (row) => row.gross_pay,
        }

      
      ] 

      useEffect(() => {
        setPage(1);
      }, [range]);


    

    
      
 
    return (
      <div className="space-y-4">
        {showProcessing && (
              <ProcessingOverlay message="Fetching HR data and computing payroll…" />
            )}
      
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Payroll Processing Module</h2>
          </div>

     
        <div className="flex justify-between gap-x-8">

            <DateRangePicker
                  value={
                    range
                      ? [new Date(range.startDate), new Date(range.endDate)]
                      : undefined
                  }
                  disabledRanges={flatpickrDisabled}
                  onChange={(newRange) => {
                    SweetAlert.confirmationAlert(
                      "Confirm Payroll Period",
                      `${newRange.startDate} → ${newRange.endDate}`,
                      () => {
                        setRange(newRange);
                        setPage(1);
                      
                      }
                    );
                  }}
                />

                    
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />   



              </div>


                    
            <Datatable columns={columns} data={tableData} />
            
                <Pagination
                      page={page}
                      totalPages={employee_payroll?.meta.totalPages ?? 1}
                      totalItems={employee_payroll?.meta.total ?? 0}
                      pageSize={PAGE_SIZE}
                      onPageChange={setPage}
                    />


        
              <div className="flex justify-between pt-4">

                <button onClick={onBack} className="rounded-lg border px-5 py-2 text-sm">
                  Back
                </button>

                <button onClick={async () => {
                    await queryClient.refetchQueries({
                      queryKey: ["payroll-display"],
                      exact: true,
                    });
                    onNext();
                  }}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white">
                  Continue
                </button>

              </div>



            </div>
    );
  }
  