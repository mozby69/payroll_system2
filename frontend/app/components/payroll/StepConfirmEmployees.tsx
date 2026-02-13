import { Column, EmployeeRow } from "@/app/types/preparePayroll";
import Datatable from "../Datatable";
import { Pagination } from "../Pagination";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import RequestModal from "../Modal";
import { PayrollSavePayload, ViewEmployeePayroll } from "@/app/ModalContent/main_payroll";
import { useUpdateEmployeePayroll } from "@/app/hooks/usePreparePayroll";
import SweetAlert from "../Swal";
import { useQueryClient } from "@tanstack/react-query";
import { AddLoanModal } from "@/app/ModalContent/AddLoan";


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



export default function StepConfirmEmployees({data,meta,search,onSearchChange,page,onPageChange,onNext}: Props) {

  const PAGE_SIZE = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [selectedRow, setSelectedRow] = useState<EmployeeRow | null>(null);
  const updatePayrollMutation = useUpdateEmployeePayroll();
  
  const [rows, setRows] = useState<EmployeeRow[]>(data);

  

  const openModal2 = () => {;
    setIsModalOpen2(true);
  };

  const closeModal2 = () => {;
    setIsModalOpen2(false);
  };
  const openModal = (row: EmployeeRow) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };
  
  useEffect(() => {
    setRows(data);
  }, [data]);

  useEffect(() => {
    if (!selectedRow) return;
  
    const fresh = rows.find(r => r.EmpCode === selectedRow.EmpCode);
    if (fresh) {
      setSelectedRow(fresh);
    }
  }, [rows]);
  

    
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
    },
    {
      header:"SSS",
      accessor: (row) => row.sss_contrib,
    },
    {
      header:"Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
          onClick={() => openModal(row)}
          className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded">
          <FileText/>
          </button>
        </div>
      ),
    }

  ]



  const queryClient = useQueryClient();

  const savePayrollSilently = async (payload: PayrollSavePayload) => {
    if (!selectedRow) return;

    await updatePayrollMutation.mutateAsync({
      empCode: selectedRow.EmpCode,
      ...payload,
    });

    await queryClient.invalidateQueries({
      queryKey: ["employees"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["employees-computed"],
    });
  };

  const handleSavePayroll = async (payload: PayrollSavePayload) => {
    await savePayrollSilently(payload);

    SweetAlert.successAlert("Saved successfully");
    closeModal();
  };
  
  

  return (

    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">
        Confirm Employee Details
      </h2>

      <div className="flex justify-between">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
      />   
       <div>
        <button 
        onClick={() => openModal2()}
        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded shadow-lg text-white cursor-pointer">Add Loan</button>
      </div>
      </div>

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
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-500">
          Continue
        </button>
      </div>




     {isModalOpen && selectedRow && (
      <RequestModal size="xxxl" title={`Employee:${selectedRow.Firstname}, ${selectedRow.Lastname}`} onClose={closeModal}>
        <ViewEmployeePayroll
          key={selectedRow.EmpCode}
          employeeSummary={selectedRow}
          onFinalSave={handleSavePayroll}
          onQuickSave={savePayrollSilently}
          onClose={closeModal}
        />
      </RequestModal>
    )}


      {isModalOpen2 && (
          <RequestModal size="xxl" title="ADD LOAN" onClose={closeModal2}>
            <AddLoanModal onClose={closeModal2}/>
          </RequestModal>
        )}

      


    </div>




  );
}