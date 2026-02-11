import {
    LayoutDashboard,
    Calculator,
    Archive,
    CircleDollarSign,
    BookMarked,
    User,
    Receipt,
    ShieldCheck,
    HandCoins,
    PhilippinePeso
  } from "lucide-react"
  
  export const MENU_SECTIONS = [
    {
      title: "General",
      items: [
        {
          label: "Dashboard",
          path: "/",
          icon: LayoutDashboard
        },
        {
          label: "Run Payroll",
          path: "/main-payroll",
          icon: Calculator,
          permission: "BONUS_GENERATE"
        },
        {
          label: "Payroll Archive",
          path: "/archive-payroll",
          icon: Archive,
          permission: "BONUS_GENERATE"
        },
        {
          label: "Bonus Manager",
          path: "/bonus-manager",
          icon: CircleDollarSign,
          permission: "BONUS_RELEASE" // 🔑 ONLY ADMIN / HR
        },
        {
          label: "Payroll List",
          path: "/financial-page",
          icon: BookMarked,
          permission: "BONUS_GENERATE"
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
          permission: "BONUS_GENERATE"
        },
        {
          label: "Employees Payslip",
          path: "/payslip",
          icon: Receipt,
          permission: "BONUS_GENERATE"
        }
      ]
    },
    {
      title: "Deductions",
      items: [
        {
          label: "Statutory Deductions",
          path: "/statutory-deductions",
          icon: ShieldCheck,
          permission: "BONUS_GENERATE"
        },
        {
          label: "Employees Loan",
          path: "/employee-loan",
          icon: HandCoins,
          permission: "BONUS_GENERATE"
        }
      ]
    },
    {
      title: "Benefits",
      items: [
        {
          label: "Employees Allowance",
          path: "/allowance",
          icon: PhilippinePeso,
          permission: "BONUS_GENERATE"
        }
      ]
    }
  ]
  