'use client';
import SweetAlert from "@/app/components/Swal";
import DateRangePicker from "../DateRangePicker";
import { DateRange } from "@/app/types/utilsTypes";
import { useEffect, useState } from "react";
import { useDisabledPayrollDates, useFetchApiAttendance } from "@/app/hooks/useApiProcess";
import { normalizeDisabledRanges } from "@/app/helper/flatPickerHelper";
import { ProcessingOverlay } from "../loader/ProcessingOverlay";
import { useComputedPayroll, useInitializeComputedPayroll } from "@/app/hooks/usePreparePayroll";
import { useDebounce } from "@/app/helper/useDebounce";
import { ComputedProps } from "@/app/services/preparePayroll";
import Datatable from "@/app/components/Datatable";
import { Column } from "@/app/types/preparePayroll";
import { useQueryClient } from "@tanstack/react-query";


interface props{
    branchCycle:string;
}

export default function SelectDate({branchCycle}:props){
      const [range, setDateRange] = useState<DateRange | null>(null);
      const isDisabled = !branchCycle;
      const cycle = branchCycle;
      const PAGE_SIZE = 7;
      const [page, setPage] = useState(1);
      const [search, setSearch] = useState("");
      const debouncedSearch = useDebounce(search, 400);
      const queryClient = useQueryClient();

      const { data: disabledRanges = [] } = useDisabledPayrollDates(branchCycle);
      const flatpickrDisabled = normalizeDisabledRanges(disabledRanges);

      const { data: employee_payroll } = useInitializeComputedPayroll({
        cycle,
        page,
        limit: 6,
        search: debouncedSearch,
        range,
        });
      
       const tableData: ComputedProps[] = employee_payroll?.data ?? [];

        const { isFetching,isSuccess,error  } = useFetchApiAttendance(
          range
            ? {
                startDate: range.startDate,
                endDate: range.endDate,
                branchCycle,
              }
            : null
        );
      
        const showProcessing = isFetching && !!range;



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
                  header:"UNDERTIME",
                  accessor: (row) => row.undertime,
                },
                {
                  header:"GROSS PAY",
                  accessor: (row) => row.gross_pay,
                }
              ] 

              useEffect(() => {
                  if (isSuccess) {
                    queryClient.invalidateQueries({
                      queryKey: ["employees-computed-initialize"],
                    });
                  }
                }, [isSuccess, queryClient]);

    return(
        <div>

            {showProcessing && (
                    <ProcessingOverlay message="Fetching HR data and computing payroll…" />
                  )}
                  
           
            <div className="mb-4">
            <DateRangePicker
                    value={
                        range
                        ? [new Date(range.startDate), new Date(range.endDate)]
                        : undefined
                    }
                    disabledRanges={flatpickrDisabled}
                    disabled={isDisabled}
                    placeholder={
                      isDisabled ? "Select payroll cycle first" : "Select payroll date"
                    }
                    onChange={(newRange) => {
                        SweetAlert.confirmationAlert(
                        "Confirm Payroll Period",
                        `${newRange.startDate} → ${newRange.endDate}`,
                        () => {
                            setDateRange(newRange);
                            //setPage(1);
                        
                        }
                        );
                    }}
                    />
                </div> 


                <Datatable columns={columns} data={tableData} />



        </div>
    );
}