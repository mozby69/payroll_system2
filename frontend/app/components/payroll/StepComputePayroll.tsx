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
import {  useArchivePayroll } from "@/app/hooks/usePayrollArchive";
import { AxiosError } from "axios";


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
      const archiveMutation = useArchivePayroll();
      const payrollPeriod = range ? `${range.startDate} to ${range.endDate}` : null;


      const { data: employee_payroll } = useComputedPayroll({
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



      const handleContinue = () => {
        if (!cycle) {
          SweetAlert.warningAlert(
            "Payroll Cycle Required",
            "Please select a payroll cycle before continuing."
          );
          return;
        }
      
        if (!range) {
          SweetAlert.warningAlert(
            "Payroll Period Required",
            "Please select a payroll period."
          );
          return;
        }
      
        SweetAlert.confirmationAlert(
          "Confirm Payroll Save",
          "Are you sure you want to save this payroll?",
          () => {
            archiveMutation.mutate(
              {
                cycle,
                payrollPeriod: `${range.startDate} to ${range.endDate}`,
              },
              {
                onError: (error) => {
                  if (error.response?.status === 409) {
                    SweetAlert.warningAlert(
                      "Already Archived",
                      error.response.data?.message ?? "Payroll already saved."
                    );
                    return;
                  }
            
                  SweetAlert.errorAlert(
                    "Archiving Failed",
                    "Something went wrong while saving the payroll."
                  );
                },
            
                onSuccess: (data) => {
                  SweetAlert.successAlert(
                    "Payroll Archived",
                    data.message
                  );
                  onNext();
                },
              }
            );
            
          }
        );
      };
      
      

    
    
    return (
      <div className="space-y-4">
        {showProcessing && (
              <ProcessingOverlay message="Fetching HR data and computing payroll…" />
            )}
      
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Payroll Processing Module</h2>
          </div>

     
        <div className="flex justify-between gap-x-8">

        <div className="flex gap-x-4">

      
            <DateRangePicker
                  value={
                    range
                      ? [new Date(range.startDate), new Date(range.endDate)]
                      : undefined
                  }
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

          <div className="">
            <button onClick={handleContinue} disabled={archiveMutation.isPending} className="bg-sky-600 hover:bg-sky-500 px-8 text-white py-2.5 rounded">
            {archiveMutation.isPending ? "Archiving…" : "Save"}
              </button>
          </div>

        </div>


              
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

          <button onClick={onNext} className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white disabled:opacity-50">
          Continue
          </button>

        </div>



      </div>
    );
  }
  