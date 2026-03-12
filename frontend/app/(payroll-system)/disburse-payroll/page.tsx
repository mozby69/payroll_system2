"use client";

import GenButton from "@/app/components/Buttons";
import { useSearchParams, useRouter } from "next/navigation";
import { useApproveDisburse, useDisburseDetails, useMainDisburse } from "../../hooks/disburse";
import { useMemo, useRef, useState } from "react";
import { Check, Printer, View } from "lucide-react";
import SweetAlert from "@/app/components/Swal";
import RequestModal from "@/app/components/Modal";
import { useReactToPrint } from "react-to-print";

function DisbursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();


  const payrollPeriodParam =
    searchParams.get("payrollPeriod") ?? "";

  const statusParam =
    searchParams.get("status") ?? "";

  const summaryRef = useRef<HTMLDivElement>(null);

  const page = Number(searchParams.get("page") ?? "1");


  const [payrollPeriod, setPayrollPeriod] =
    useState(payrollPeriodParam);

  const [status, setStatus] =
    useState(statusParam);


  const [openDetails, setOpenDetails] = useState(false);
  const [selectedDisburseId, setSelectedDisburseId] = useState<number | null>(null);

  const { data, isLoading, isFetching } =
    useMainDisburse({
      payrollPeriod:
        payrollPeriod || undefined,
      status:
        (status as
          | "AWAITING"
          | "APPROVED"
          | "REJECTED") || undefined,
      page,
      limit: 10,
    });

    const { data: detailsData, isLoading: detailsLoading } = useDisburseDetails(selectedDisburseId);

    const { mutate: approveMutate } = useApproveDisburse();

    const [branchFilter, setBranchFilter] = useState("");

    const branches = useMemo(() => {
      if (!detailsData) return [];

      const map = new Map();

      detailsData.forEach((item) => {
        const branch = item.empArchive.EmpCode.BranchCode;

        if (branch && !map.has(branch.branchCode)) {
          map.set(branch.branchCode, branch);
        }
      });

      return Array.from(map.values());
    }, [detailsData]);


    const filteredDetails = useMemo(() => {
      if (!detailsData) return [];

      if (!branchFilter) return detailsData;

      return detailsData.filter(
        (item) =>
          item.empArchive.EmpCode.BranchCode?.branchCode === branchFilter
      );
    }, [detailsData, branchFilter]);

    const handlePrintDisburse = useReactToPrint({
          contentRef: summaryRef,
          documentTitle: `Disburse-Payroll`,
      })
      

    const handleApproved = (mainDisburseID: number) => {
      SweetAlert.confirmationAlert(
        "Disbursing Approval",
        "Are you sure you want to proceed with this Disburse?",
        () => {
  
          approveMutate(mainDisburseID);
          SweetAlert.successAlert("Approved Succesfully")
        }
      );
    };

    const handleDetails = (mainDisburseID: number) => {
      setSelectedDisburseId(mainDisburseID);
      setOpenDetails(true);
    };


  const handleApplyFilter = () => {
    const params = new URLSearchParams();

    if (payrollPeriod)
      params.set("payrollPeriod", payrollPeriod);

    if (status)
      params.set("status", status);

    params.set("page", "1");

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleResetFilter = () => {
    setPayrollPeriod("");
    setStatus("");

    router.replace(`?page=1`, {
      scroll: false,
    });
  };
  

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("page", String(newPage));

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };


  return (
    <div className="relative w-full min-h-screen flex flex-col items-center py-8 text-mainGray">
      <div className="w-[95%] flex flex-col gap-y-4">

       
        <div>
          <h1 className="text-2xl font-bold">
            Payroll Disbursement
          </h1>
          <p className="text-xs text-mainLightGray">
            Payroll Disbursement History
          </p>
        </div>

   
        <div className="bg-mainNeutral text-mainGray p-4 rounded-md flex flex-wrap gap-4 items-end">

       
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">
                Payroll Period
              </label>
              <input
                type="month"
                value={payrollPeriod}
                onChange={(e) =>
                  setPayrollPeriod(e.target.value)
                }
                className="px-3 py-2 rounded-md bg-mainLight"
              />
          </div>
        
          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="px-4 py-2 rounded-md bg-mainLight"
            >
              <option value="">All</option>
              <option value="AWAITING">
                Awaiting
              </option>
              <option value="APPROVED">
                Approved
              </option>
              <option value="REJECTED">
                Rejected
              </option>
            </select>
          </div>

          
          <div className="flex gap-3">
            <GenButton
              onClick={handleApplyFilter}
            >
              Apply Filter
            </GenButton>

            <GenButton
              variant="secondary"
              onClick={handleResetFilter}
            >
              Reset Filter
            </GenButton>
          </div>
        </div>

      
        <div className="mt-2 w-full">

          {isLoading ? (
            <div className="text-center py-10">
              Loading disbursements...
            </div>
          ) : (
            <>
              {data?.data.length === 0 ? (
                <div className="text-center py-10">
                  No disbursement records found.
                </div>
              ) : (
                <div className="overflow-x-auto bg-mainNeutral rounded-xl border border-mainNeutral">
                  
                  <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow-lg">
                    <thead className="bg-mainBg text-mainLight uppercase text-xs">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          Payroll Cycle
                        </th>
                        <th className="px-6 py-3 text-left">
                          Payroll Period
                        </th>
                        <th className="px-6 py-3 text-left">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-right">
                          Employees
                        </th>
                        <th className="px-6 py-3 text-center">
                            Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {data?.data.map(
                        (batch) => (
                          <tr
                            key={
                              batch.mainDisburseID
                            }
                            className="hover:odd:bg-mainNeutral hover:cursor-pointer transition odd:bg-mainLight even:bg-mainNeutral text-sm"
                          >
                            <td className="px-6 py-4 font-medium">
                              {
                                batch.payrollCycle
                              }
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {
                                batch.payrollPeriod
                              }
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  batch.status ===
                                  "APPROVED"
                                    ? "bg-positive text-mainLight"
                                    : batch.status ===
                                      "REJECTED"
                                    ? "bg-negative text-mainLight"
                                    : "bg-decision text-mainLight"
                                }`}
                              >
                                {batch.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-gray-500">
                              {new Date(
                                batch.createdAt
                              ).toLocaleDateString()}
                            </td>

                            <td className="px-6 py-4 text-right font-semibold">
                              ₱
                              {Number(
                                batch.totalDisburse
                              ).toLocaleString()}
                            </td>

                            <td className="px-6 py-4 text-right">
                              {
                                batch._count
                                  .empDisburses
                              }
                            </td>
                            <td className={`px-2 py-4 inline-flex gap-2 justify-start items-center`}>
                              <GenButton
                                variant="outline"
                                onClick={
                                  () =>
                                    handleDetails(batch.mainDisburseID)
                                }
                                className="text-xs"
                                >
                                    <View size={16} /> Details
                              </GenButton>
                       
                               <GenButton
                                variant={`${batch.status !== "AWAITING" ? "secondary" :"positive"}`}
                                disabled={batch.status !== "AWAITING"}
                                onClick={() =>
                                 handleApproved(batch.mainDisburseID)
                                }
                                className="text-xs"
                                >
                                    <Check size={16} /> Approve
                              </GenButton>
                  
                             
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

        
              {data &&
                data.totalPages > 1 && (
                  <div className="flex justify-end gap-3 mt-6">
                    <GenButton
                      disabled={page <= 1}
                      onClick={() =>
                        handlePageChange(
                          page - 1
                        )
                      }
                    >
                      Prev
                    </GenButton>

                    <GenButton
                      disabled={
                        page >=
                        data.totalPages
                      }
                      onClick={() =>
                        handlePageChange(
                          page + 1
                        )
                      }
                    >
                      Next
                    </GenButton>
                  </div>
                )}
            </>
          )}

          {isFetching && !isLoading && (
            <div className="text-xs text-gray-400 mt-2">
              Updating...
            </div>
          )}
        </div>
      </div>


    {openDetails && (
        <RequestModal
          size="xxl"
          title="Disbursement Details"
          onClose={() => {
            setOpenDetails(false);
            setSelectedDisburseId(null);
          }}
        >
          {detailsLoading ? (
            <div className="py-6 text-center">
              Loading details...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex w-full justify-end gap-x-4">
                <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.branchCode} value={b.branchCode}>
                        {b.branchCode}
                      </option>
                    ))}
                </select>
                <GenButton
                  variant="primary"
                  className="inline-flex items-center justify-center"
                  onClick={handlePrintDisburse}
                >
                    <Printer size={16} /> Print Disburse Data
                </GenButton>
              </div>

                    <div ref={summaryRef} className="my-8">
                      <table  className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow-lg my-4">
                        <thead className="bg-mainBg text-mainLight uppercase text-xs">
                          <tr>
                            <th className="px-8 py-4 text-left">
                              Employee Code
                            </th>
                            <th className="px-8 py-4 text-left">
                              Branch Code
                            </th>
                            <th className="px-8 py-4 text-left">
                              Name
                            </th>
                            <th className="px-8 py-4 text-left">
                              Position
                            </th>
                            <th className="px-8 py-4 text-left">
                              Department
                            </th>
                            <th className="px-8 py-4 text-right">
                              Net Pay
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                        {filteredDetails?.map((item) => (
                          <tr key={item.disburseID} className="border-t hover:odd:bg-mainNeutral hover:cursor-pointer transition odd:bg-mainLight even:bg-mainNeutral">
                            <td className="px-8 py-4">
                              {item.empArchive.EmpCode.EmpCode}
                            </td>
                            <td className="px-8 py-4">
                              {item.empArchive.EmpCode.BranchCode?.branchCode}
                            </td>
                            <td className="px-8 py-4">
                              {item.empArchive.EmpCode.Lastname},{" "}
                              {item.empArchive.EmpCode.Firstname}
                            </td>
                            <td className="px-8 py-4">
                              {item.empArchive.EmpCode.Position}
                            </td>
                            <td className="px-8 py-4">
                              {item.empArchive.EmpCode.Department}
                            </td>
                            <td className="px-8 py-4 text-right font-semibold">
                              ₱{Number(item.empArchive.Netpay).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                            </tbody>
                          </table>
                    </div>
                </div>
              )}
            </RequestModal>
          )}

    </div>
  );
}

export default function DisbursementPayroll() {
  return <DisbursePage />;
}