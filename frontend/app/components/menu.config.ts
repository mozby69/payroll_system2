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
    PhilippinePeso,
    CreditCard
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
          label: "Payroll",
          icon: Calculator,
          permission: "BONUS_GENERATE",
          children: [
            {
              label: "Run Payroll",
              path: "/main-payroll",
              icon: Calculator,
            },
            {
              label: "Payroll Archive",
              path: "/archive-payroll",
              icon: Archive,
            },
            {
              label: "Payroll List",
              path: "/financial-page",
              icon: BookMarked,
            }
          ]
        },
        {
          label:"Disbursement",
          path:"/disburse-payroll",
          icon: CreditCard,
          permission: "BONUS_GENERATE",
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
          label: "Bonus Manager",
          path: "/bonus-manager",
          icon: CircleDollarSign,
          permission: "BONUS_VIEW"
        },
          {
          label: "Employees Allowance",
          path: "/allowance",
          icon: PhilippinePeso,
          permission: "BONUS_GENERATE"
        },
      ]
    }
  ]
  