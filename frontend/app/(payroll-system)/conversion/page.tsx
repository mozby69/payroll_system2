'use client';
import Datatable from "@/app/components/Datatable";
import RequestModal from "@/app/components/Modal";
import { Pagination } from "@/app/components/Pagination";
import SweetAlert from "@/app/components/Swal";
import { useAuth } from "@/app/components/UserContext";
import { useDebounce } from "@/app/helper/useDebounce";
import { useFetchConversion, useSaveConversionArchive } from "@/app/hooks/useConversion";
import { useImportAttendanceCount } from "@/app/hooks/usePreparePayroll";
import EditLeave from "@/app/ModalContent/Conversion/EditLeave";
import ConversionReport from "@/app/ModalContent/Conversion/Report";
import { conversionProps } from "@/app/types/conversionType";
import { Column } from "@/app/types/preparePayroll";
import { Pencil } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";




export default function ConversionPage() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const { mutate: saveArchive, isPending: isSaving } = useSaveConversionArchive();

  const { user } = useAuth();
  const company_id = user?.company_id;

  const { data: conversion_data, } = useFetchConversion({ page, limit: 10, search: debouncedSearch, company_id });

  const { mutate: generateAttendance, isPending } = useImportAttendanceCount();
  const [selectedRow, setSelectedRow] = useState<conversionProps | null>(null);

  const tableData: conversionProps[] = conversion_data?.data ?? [];


  const handleSaveArchive = () => {
    if (!company_id) {
      SweetAlert.errorAlert("Error", "Company ID is missing");
      return;
    }

    SweetAlert.confirmationAlert(
      "Save Archive?",
      "This will save the conversion for this year",
      () => {
        SweetAlert.loadingAlert(
          "Saving Conversion...",
          "Please wait while archiving data."
        );

        saveArchive(company_id, {
          onSuccess: () => {
            Swal.close();

            SweetAlert.successAlert(
              "Saved",
              "Conversion archived successfully"
            );
          },

          onError: (err: unknown) => {
            Swal.close();

            const error = err as {
              response?: {
                status: number;
                data?: {
                  message?: string;
                };
              };
            };

            const status = error.response?.status;
            const message = error.response?.data?.message;


            if (status === 409) {
              SweetAlert.warningAlert(
                "Warning",
                message || "Conversion already exists for this year"
              );
              return;
            }


            SweetAlert.errorAlert(
              "Error",
              message || "Failed to save archive"
            );
          }
        });
      }
    );
  };


  const handleGenerate = () => {
    SweetAlert.loadingAlert(
      "Generating Conversion...",
      "Please wait while processing data."
    );

    generateAttendance(undefined, {
      onSuccess: () => {
        Swal.close();
        // setHasGenerated(true);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Update data successfully.",
        });
      },
      onError: (err) => {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Import Failed",
          text: err.message,
        });
      },
    });
  };

  const columns: Column<conversionProps>[] = [
    {
      header: "EmpCode",
      accessor: (row) => row.EmpCode,
    },
    {
      header: "Name",
      render: (row) => `${row.lastname}, ${row.firstname}`,
    },
    {
      header: "Vacation Leave",
      render: (row) => `${row.vacation}`,
    },
    {
      header: "Sick Leave",
      render: (row) => `${row.sick}`,
    },
    {
      header: "Amount",
      render: (row) => `${row.total}`,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal(row)}
            className="px-3 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded">
            <Pencil />
          </button>
        </div>
      ),
    }
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openModal = (row: conversionProps) => {
    console.log("ROW DATA:", row)
    setSelectedRow(row);
    setIsModalOpen(true);
  };


  const openModal2 = () => {
    setIsModalOpen2(true);
  };

  const closeModal2 = () => {
    setIsModalOpen2(false);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  };


  return (
    <>

      <div className="p-8">

        <div className="py-8">
          <h1 className="font-semibold text-xl text-gray-800">BENEFITS</h1>
          <h1 className="text-md text-gray-600">Employees Leave Conversion</h1>
        </div>

        <div className="mb-4 flex justify-between">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          />

          <div className="flex gap-x-2">
            <button
              onClick={handleGenerate}
              disabled={isPending}
              className="py-2 px-6 shadow-md rounded-lg bg-green-700 text-white hover:bg-green-600 disabled:opacity-50">
              {isPending ? "Generating..." : "Generate"}
            </button>

            <button
              onClick={openModal2}
              className="bg-yellow-700 hover:bg-yellow-600 hover:cursor-pointer text-white rounded-lg px-8 py-2">
              View
            </button>


            <button onClick={handleSaveArchive}
              className="bg-blue-700 hover:bg-blue-600 px-8 py-2 rounded-lg text-white">
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>

        </div>



        <>
          <Datatable columns={columns} data={tableData} />
          <Pagination
            page={page}
            totalPages={conversion_data?.meta.totalPages ?? 1}
            totalItems={conversion_data?.meta.total ?? 0}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>





        {isModalOpen && selectedRow && (
          <RequestModal size="lg" title="EDIT LEAVE" onClose={closeModal}>
            <EditLeave key={selectedRow.id} data={selectedRow} onClose={closeModal} />
          </RequestModal>
        )}


        {isModalOpen2 && (
          <RequestModal size="xxxl" title="VIEW REPORT" onClose={closeModal2}>
            <ConversionReport />
          </RequestModal>
        )}



      </div>

    </>
  );
}