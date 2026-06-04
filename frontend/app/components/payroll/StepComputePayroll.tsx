// import DateRangePicker from "@/app/ui/DateRangePicker";
// import SweetAlert from "../Swal";
import {  useState } from "react";
import { DateRange } from "@/app/types/utilsTypes";
import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay";
import { Column } from "@/app/types/preparePayroll";
import Datatable from "../Datatable";
import { useComputedPayroll } from "@/app/hooks/usePreparePayroll";
import { useDebounce } from "@/app/utils/useDebounce";
import { ComputedProps } from "@/app/services/preparePayroll";
import { Pagination } from "../Pagination";
import { useQueryClient } from "@tanstack/react-query";
// import { useDisabledPayrollDates } from "@/app/hooks/useApiProcess";
// import { normalizeDisabledRanges } from "@/app/helper/flatPickerHelper";
import { useAuth } from "../UserContext";
import { Edit, Timer } from "lucide-react";
import RequestModal from "../Modal";
import EditDeduction from "@/app/ModalContent/PreparePayroll/EditDeducution";
import ViewOvertime from "@/app/ModalContent/PreparePayroll/ViewOvertime";


interface Props {
  range: DateRange | null;
  setRange: (range: DateRange) => void;
  cycle: string;
    onBack: () => void;
    onNext: () => void;
  }


  
  
  export default function StepComputePayroll({ onBack, onNext,range }: Props) {
      const PAGE_SIZE = 7;
      const [page, setPage] = useState(1);
      const [search, setSearch] = useState("");
      const debouncedSearch = useDebounce(search, 400);
      const [showProcessing] = useState(false);

      //const payrollPeriod = range ? `${range.startDate} to ${range.endDate}` : null;
      const queryClient = useQueryClient();
      //const { data: disabledRanges = [] } = useDisabledPayrollDates(cycle);
      const { user } = useAuth()
      const companyId = user?.company_id;
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isModalOpen2, setIsModalOpen2] = useState(false);
      const [selectedRow, setSelectedRow] = useState<ComputedProps | null>(null);
      //const flatpickrDisabled = normalizeDisabledRanges(disabledRanges);

      const { data: employee_payroll } = useComputedPayroll({
          company_id: companyId ?? "",
          page,
          limit: 6,
          search: debouncedSearch,
          range,
        });

      const tableData: ComputedProps[] = employee_payroll?.data ?? [];

      const payCode = employee_payroll?.data?.[0]?.PayCode ?? "-";

      const columns: Column<ComputedProps>[] = [
        {
          header: "Employee",
          render: (row) =>
            `${row.EmpCode.Firstname}, ${row.EmpCode.Lastname}`,
        },
      
        {
          header:"EMPCODE",
          accessor: (row) => row.EmpCodeId,
        },
        {
          header:"BRANCH",
          accessor: (row) => row.EmpCode.BranchCode.branchCode,
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
        },
        {
          header: "Actions",
          render: (row) => (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedRow(row);
                  setIsModalOpen(true);
                }}
                className="shadow px-3 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded">
                <Edit /> 
              </button>
              <button
              onClick={() => {
                setSelectedRow(row);
                setIsModalOpen2(true);
              }} 
              className="px-3 py-2 text-sm bg-sky-800 hover:bg-sky-600 text-white rounded shadow">
                  <Timer/>
              </button>
            </div>
          ),
        }

      
      ] 

      // useEffect(() => {
      //   setPage(1);
      // }, [range]);


      const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
      };


        
    const closeModal = () => {
      setIsModalOpen(false);
    };

      const closeModal2 = () => {
      setIsModalOpen2(false);
    };
      
      
 
    return (
      <div className="space-y-4">
        {showProcessing && (
              <ProcessingOverlay message="Fetching HR data and computing payroll…" />
            )}
      
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Payroll Processing Module</h2>
          </div>

     
        <div className="flex justify-between gap-x-4">
          <div>
            <h2 className="font-semibold">Payroll Period: <span className="font-medium">{payCode}</span></h2>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
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
                    await queryClient.invalidateQueries({
                      queryKey: ["payroll-display"],
                    });
                
                    await queryClient.invalidateQueries({
                      queryKey: ["variance-display"],
                    });
                    onNext();
                  }}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white">
                  Continue
                </button>

              </div>


                 {isModalOpen && selectedRow && (
                    <RequestModal size="xxl" title={`EDIT DEDUCTION`} onClose={closeModal}>
                      <EditDeduction employee={selectedRow} onClose={closeModal}/>
                    </RequestModal>
                  )}

                  {isModalOpen2 && selectedRow && (
                    <RequestModal size="lg" title={`VIEW TIME OF OVERTIME`} onClose={closeModal2}>
                      <ViewOvertime employee={selectedRow} onClose={closeModal2}/>
                    </RequestModal>
                  )}
              


              



            </div>
    );
  }
  