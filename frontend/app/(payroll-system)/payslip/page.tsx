"use client"

import { Filter, Printer, PrinterIcon, ViewIcon, X } from "lucide-react"
import { formatCurrency } from "../../utils/currencyConverter"

import { useState } from "react"
import { paySlipDummyData } from "@/app/types/dummyData"
import FilterModal from "@/app/components/Filter"
import ActiveFilters from "@/app/components/FilterObject"
import GenButton from "@/app/components/Buttons"
import { useRouter, useSearchParams } from "next/navigation"

  
  
  const PaySlip = () => {

    // Filter 
    const [open, setOpen]= useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const filters = {
        department: searchParams.getAll("department"),
        company: searchParams.getAll("company"),
        status: searchParams.getAll("status"),
    };

    const updateParams = (fn: (params: URLSearchParams) => void) => {
        const params = new URLSearchParams(searchParams.toString());
        fn(params);
        router.replace(`?${params.toString()}`, { scroll: false });
    };


    const toggleFilter = (key: string, value: string) => {
        updateParams((params) => {
        const values = params.getAll(key);

        params.delete(key);
        if (!values.includes(value)) {
            [...values, value].forEach((v) => params.append(key, v));
        } else {
            values.filter((v) => v !== value).forEach((v) => params.append(key, v));
        }

        params.set("page", "1");
        });
    };

    const removeFilter = (key: string, value: string) => {
        updateParams((params) => {
        const values = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        values.forEach((v) => params.append(key, v));
        });
    };


    const clearAll = () => {
        updateParams((params) => {
        ["department", "company", "status"].forEach((k) => params.delete(k));
        params.set("page", "1");
        });
    };
    // Filter 

      const [loading, setLoading] = useState(false);

      const handlePrint = async () => {
        const printWindow = window.open("", "_blank"); 
        try {

          console.log("data:: ", paySlipDummyData  )
          setLoading(true);
          const res = await fetch("/api/print/payroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "payslip",
              paper: "A4",
              orientation: "portrait",
              data: paySlipDummyData,
            }),
          });
      
          if (!res.ok) throw new Error("Print failed");
      
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
      
          printWindow!.location.href = url;
      
          printWindow!.onbeforeunload = () => {
            URL.revokeObjectURL(url);
          };
      
        } catch (err) {
          console.error(err);
          printWindow?.close();
          alert("Failed to print payroll");
        } finally {
          setLoading(false);
        }
      };
      

    return (
      <div className="relative w-full min-h-screen flex flex-col gap-y-4 py-8 items-center  text-mainGray">
  
        <div className="w-[95%] flex flex-col gap-y-8">

          <div className=" flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1 className="font-bold text-2xl ">Payslip</h1>
              <p className="text-sm text-mainLightGray">Complete list of Employees Payslip</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">


           

              <input
                placeholder="Search..."
                className="px-4 py-2 rounded-md bg-mainNeutral w-full"
              />

            
              <GenButton variant="primary" onClick={() => setOpen(true)}>
                  <span className="flex items-center gap-2">
                      <Filter size={16} />
                      Filter
                  </span>
              </GenButton>

              <GenButton variant="positive" onClick={handlePrint}> 
                    <PrinterIcon size={16}  /> <span className="font-semibold">Print</span> 
              </GenButton>
            </div>
          </div>

          <ActiveFilters 
              filters={filters}
              onRemove={removeFilter}
              onClearAll={clearAll}
          />

          
          <div className="overflow-x-auto shadow-[0_8px_20px_rgba(0,0,0,0.25)]">
            <table className="w-full border-separate border-spacing-0 rounded-t-xl overflow-hidden ">
              <thead className=" bg-mainBg text-white">
                <tr>
                  <th className="p-4 text-left">Code</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Gross Pay</th>
                  <th className="p-4 text-left">Total Deduction</th>
                  <th className="p-4 text-left">Net Payable</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paySlipDummyData.map(row => (
                  <tr key={row.employeeCode} className="odd:bg-mainLight even:bg-mainNeutral">
                    <td className="p-4">{row.employeeCode}</td>
                    <td className="p-4">{row.name}</td>
                    <td className="p-4 font-semibold">
                      {formatCurrency(row.grossPay)}
                    </td>
                    <td className="p-4 font-semibold">
                      {formatCurrency(row.totalDeduction)}
                    </td>
                    <td className="p-4 font-semibold">
                      {formatCurrency(row.netPayable)}
                    </td>
                    <td className="p-4 text-center flex gap-2 justify-center">
                      <button className="text-positive hover:underline" >
                       <ViewIcon />
                      </button>
                      <button className="text-mainGray hover:underline">
                       <Printer />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
                   <FilterModal
                          open={open}
                          onClose={() => setOpen(false)}
                          filters={filters}
                          onToggle={toggleFilter}
                        />
      </div>
    )
  }
  
  export default PaySlip
  