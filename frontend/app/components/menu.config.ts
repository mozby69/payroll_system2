import {
    LayoutDashboard,
    Calculator,
    Archive,
    CircleDollarSign,
    BookMarked,
    User,
    ShieldCheck,
    HandCoins,
    PhilippinePeso,
    CreditCard,
    FilePlus,
    WorkflowIcon
  } from "lucide-react"
import { MenuSection } from "../types/sideTypes"
  
export const MENU_SECTIONS: MenuSection[] = [

    {
      title: "General",
      items: [
        {
          label: "Dashboard",
          path: "/",
          icon: LayoutDashboard
        },
        {
          label: "Initialize Payroll",
          path: "/initialize-payroll",
          icon: WorkflowIcon,
          permission: "PAYROLL_INITIALIZE"
        },

        {
          label: "Payroll",
          icon: Calculator,
          children: [
            {
              label: "Run Payroll",
              path: "/main-payroll",
              icon: Calculator,
              permission:"PAYROLL_RUN"
            },
            {
              label: "Payroll Archive",
              path: "/archive-payroll",
              icon: Archive,
              permission:"PAYROLL_ARCHIVE"
            },
            {
              label: "Payroll List",
              path: "/financial-page",
              icon: BookMarked,
              permission:"PAYROLL_LIST"
            }
          ]
        },
        {
          label:"Disbursement",
          path:"/disburse-payroll",
          icon: CreditCard,
          permission: "DEDUCTION_VIEW",
        }
      ]
    },
   
    {
      title: "Employees",
      items: [
        {
          label: "Employees List",
          path: "/employee-list",
          icon: User,
          permission: "EMPLOYEE_VIEW"
        },
     
      ]
    },
    {
      title: "Deductions",
      items: [
        {
          label: "Statutory Deductions",
          path: "/statutory-deductions",
          icon: ShieldCheck,
          permission: "DEDUCTION_VIEW"
        },
        {
          label: "Employees Loan",
          path: "/employee-loan",
          icon: HandCoins,
          permission: "VIEW_LOANS"
        }
      ]
    },
    {
      title: "Benefits",
      items: [
        {
          label: "Bonus Manager",
          path: "/bonus-manager",
          icon: CircleDollarSign,
          permission: "BONUS_VIEW"
        },
          {
          label: "Employees Allowance",
          path: "/allowance",
          icon: PhilippinePeso,
          permission: "ALLOWANCE_VIEW"
        },
        {
          label: "Employees Conversion",
          path: "/conversion",
          icon: FilePlus,
          permission: "CONVERSION_VIEW"
        },
      ]
    }
  ]
  