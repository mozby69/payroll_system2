import { EmployeeArchivedType } from "@/app/types/totalPayroll";


import {
    BadgeCheck,
    CalendarDays,
    RefreshCcw,
    Clock4,
    UserX,
    Timer,
    Zap,
    Wallet,
    TrendingUp,
    Banknote,
    Receipt,
    ShieldAlert,
    Landmark,
    CalendarRange,
    Hospital,
    HousePlus,
    FileText,
    HouseHeart,
    SquareLibrary,
    GlobeLock
  } from "lucide-react";

  
  interface ViewEmployeeListProps {
    employee: EmployeeArchivedType;
  }
  
  function InfoRow({icon: Icon,label,value,highlight = false}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    highlight?: boolean;
  }) {
    return (
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
          highlight
            ? "bg-emerald-50 border border-emerald-200"
            : "bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon
            size={13}
            className={highlight ? "text-emerald-600" : "text-gray-400"}
          />
          <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
            {label}
          </span>
        </div>
        <span
          className={`text-sm font-bold tabular-nums ${
            highlight ? "text-emerald-700" : "text-gray-800"
          }`}
        >
          {value}
        </span>
      </div>
    );
  }
  
  function SectionCard({title,children,accent}: {
    title: string;
    children: React.ReactNode;
    accent: string;
  }) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        <div className={`px-4 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase ${accent}`}>
          {title}
        </div>
        <div className="p-3 space-y-1.5">{children}</div>
      </div>
    );
  }
  
  export default function ViewEmployeeList({ employee }: ViewEmployeeListProps) {
    const fullName = `${employee.EmpCode.Firstname}, ${employee.EmpCode.Middlename} ${employee.EmpCode.Lastname}`;
    const initials = `${employee.EmpCode.Firstname?.[0] ?? ""}${employee.EmpCode.Middlename?.[0] ?? ""}${employee.EmpCode.Lastname?.[0] ?? ""}`.toUpperCase();
  
    const fmt = (val: string) =>
      `₱ ${parseFloat(val || "0").toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`;
  
    return (
      <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-200 w-full font-sans">
        {/* Header */}
        <div className="relative bg-linear-to-br from-slate-50 to-white px-6 pt-6 pb-5 border-b border-gray-200">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500" />
  
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
                <span className="text-xl font-bold text-white tracking-tight">
                  {initials}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                <BadgeCheck size={11} className="text-white" />
              </div>
            </div>
  
            {/* Name + meta */}
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight leading-tight truncate">
                {fullName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  <BadgeCheck size={11} />
                  {employee.EmpCodeId}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full">
                  <CalendarDays size={11} />
                  {employee.payroll_period}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full">
                  <RefreshCcw size={11} />
                  {employee.cycle_category}
                </span>

                <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full">
                  <CalendarRange size={11} />
                  {employee.PayCode}
                </span>
              </div>
            </div>
          </div>
        </div>
  
        {/* Body */}
        <div className="p-4 space-y-3 bg-gray-50/60">
          {/* Earnings */}
          <SectionCard
            title="Earnings"
            accent="bg-blue-50 text-blue-700 border-b border-blue-100"
          >
            <InfoRow
              icon={Wallet}
              label="Basic Salary"
              value={fmt(employee.Basic_salary)}
            />
            <InfoRow
              icon={TrendingUp}
              label="Gross Pay"
              value={fmt(employee.Grosspay)}
            />
            <InfoRow
              icon={Banknote}
              label="Net Pay"
              value={fmt(employee.Netpay)}
              highlight
            />
          </SectionCard>
  
          {/* Attendance */}
          <SectionCard
            title="Attendance & Time"
            accent="bg-amber-50 text-amber-700 border-b border-amber-100"
          >
            <div className="grid grid-cols-2 gap-1.5">
              <InfoRow icon={Clock4} label="Late" value={employee.Late} />
              <InfoRow icon={UserX} label="Absent" value={employee.Absent} />
              <InfoRow icon={Timer} label="Undertime" value={employee.undertime} />
              <InfoRow icon={Zap} label="Overtime" value={employee.Overtime} />
            </div>
          </SectionCard>
  
          {/* Deductions & Loans */}
          <SectionCard title="Deductions & Loans" accent="bg-rose-50 text-rose-700 border-b border-rose-100">
            
            <InfoRow
              icon={FileText}
              label="SSS"
              value={employee.SSS_employee_share || "—"}
            />

             <InfoRow
              icon={Hospital}
              label="Philhealth"
              value={employee.philhealth_employee_share|| "—"}
            />

            <InfoRow
              icon={HousePlus}
              label="Pagibig"
              value={employee.Pagibig_employee_share|| "—"}
            />

            <InfoRow
              icon={Receipt}
              label="Withholding Tax"
              value={employee.w_tax}
            />
            <InfoRow
              icon={ShieldAlert}
              label="SSS Loan"
              value={employee.sss_loan}
            />
            <InfoRow
              icon={Landmark}
              label="Pagibig Loan"
              value={employee.pagibig_loan}
            />
            
            <InfoRow
              icon={GlobeLock}
              label="SSS Calamity Loan"
              value={employee.sss_calamity_loan || "—"}
            />

            <InfoRow
              icon={SquareLibrary}
              label="AR/E"
              value={employee.ar_e || "—"}
            />

            <InfoRow
              icon={HouseHeart}
              label="FCH Loan"
              value={employee.fch_loan || "—"}
            />

          </SectionCard>
        </div>
      </div>
    );
  }