"use client"

import { Printer, ViewIcon } from "lucide-react"
import { formatCurrency } from "../utils/currencyConverter"
import { paySlipDummyData } from "../types/dummyData"
import { useState } from "react"

  
  
  const PaySlip = () => {
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
      <div className="p-4 flex flex-col gap-4">
  
        <h1 className="text-lg font-semibold">Generate Payslip</h1>
  
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select className="border rounded p-2">
            <option>Select Payroll Period</option>
          </select>
          <select className="border rounded p-2">
            <option>Select Company</option>
          </select>
          <select className="border rounded p-2">
            <option>Select Branch</option>
          </select>
        </div>
  
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search employee"
            className="border rounded p-2 w-64"
          />
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded">
            Print
          </button>
        </div>
  
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
  
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Code</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-right">Gross Pay</th>
                <th className="border p-2 text-right">Total Deduction</th>
                <th className="border p-2 text-right">Net Payable</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
  
            <tbody>
              {paySlipDummyData.map(row => (
                <tr key={row.employeeCode}>
                  <td className="border p-2">{row.employeeCode}</td>
                  <td className="border p-2">{row.name}</td>
                  <td className="border p-2 text-right">
                    {formatCurrency(row.grossPay)}
                  </td>
                  <td className="border p-2 text-right">
                    {formatCurrency(row.totalDeduction)}
                  </td>
                  <td className="border p-2 text-right font-semibold">
                    {formatCurrency(row.netPayable)}
                  </td>
                  <td className="border p-2 text-center flex gap-2 justify-center">
                    <button className="text-green-600 hover:underline" >
                     <ViewIcon /> 
                    </button>
                    <button className="text-blue-600 hover:underline">
                     <Printer />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
  
          </table>
        </div>
  
      </div>
    )
  }
  
  export default PaySlip
  