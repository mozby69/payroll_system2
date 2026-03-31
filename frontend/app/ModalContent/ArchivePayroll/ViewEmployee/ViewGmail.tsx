"use cliemt";
import SweetAlert from "@/app/components/Swal";
import { EmployeeArchivedType } from "@/app/types/totalPayroll";
import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay";




import { Mail, BadgeCheck, User } from "lucide-react";


interface ViewEmployeeListProps {
  employee: EmployeeArchivedType;
}


export default function EmployeeGmail({ employee }: ViewEmployeeListProps) {

const handleSendPayslip = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payroll-archive/send-email-payslip`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employee }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send payslip");
    }

    // ✅ Success
    SweetAlert.successAlert("Payslip sent successfully");

  } catch (error) {
    console.error(error);

    SweetAlert.errorAlert(
      error instanceof Error ? error.message : "Something went wrong"
    );
  }
};

  const fullName = `${employee.EmpCode.Firstname} ${employee.EmpCode?.Lastname ?? ""}`.trim();
  const email = employee.EmpCode?.employeepayroll?.gmail_account ?? "—";
  const initials = `${employee.EmpCode.Firstname?.[0] ?? ""}${employee.EmpCode?.Lastname?.[0] ?? ""}`.toUpperCase();


  return (
    <div className="min-w-[320px] p-1 font-sans">


                    {showProcessing && (
                            <ProcessingOverlay message="Fetching HR data and computing payroll…" />
                          )}
                          

      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="p-[2.5px] bg-linear-to-br from-indigo-500 to-violet-600 rounded-full shrink-0">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-indigo-600 text-base font-bold border-2 border-white tracking-wide">
            {initials}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-bold text-gray-800 leading-tight m-0">{fullName}</p>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-[11px] font-semibold rounded-full w-fit">
            <BadgeCheck size={11} />
            Active Employee
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-4" />

      {/* Cards */}
      <div className="flex flex-col gap-2.5">

        {/* Employee Code */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <User size={14} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Employee Code
            </span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono w-fit">
              {employee.EmpCodeId}
            </span>
          </div>
        </div>

        {/* Gmail */}
        <div className="flex flex-wrap items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
            <Mail size={14} />
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Gmail Account
            </span>
            <span className="text-[13px] font-semibold text-gray-800 break-all">
              {email}
            </span>
          </div>
          <div className="flex gap-2 w-full pl-11">
        
            {email !== "—" && (

               <button onClick={handleSendPayslip} className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-600">
                Send Payslip
                </button>
            //   <a
            //    href={`https://mail.google.com/mail/?view=cm&to=${email}`}
            //    target="blank"
            //     className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white text-red-500 border-slate-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
            //     <ExternalLink size={12} />
            //         Email Payslip
            //   </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}