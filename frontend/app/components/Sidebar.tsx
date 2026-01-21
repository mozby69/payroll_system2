"use client";

import { LayoutDashboard ,Archive, Calculator, MenuIcon, ShieldCheck , Receipt, User, XIcon,HandCoins  } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";



//Tab list design 
const MENU_SECTIONS = [
  {
    title: "General",
    items: [
        { label: "Dashboard", path:"/", icon: LayoutDashboard},
        { label: "Run Payroll", path:"/main-payroll", icon: Calculator },
        { label: "Payroll Archive", path:"/archive-payroll", icon: Archive },
    ],
  },
  {
    title: "Employees",
    items: [
        { label: "Employees List", path:"/employee-list", icon: User },
        { label: "Employees Payslip", path:"/payslip", icon: Receipt },
    ],
  },
  {
    title: "Deductions",
    items: [
        { label: "Statutory Deductions", path:"", icon: ShieldCheck },
        { label: "Employees Loan", path:"", icon: HandCoins },
    ],
  },
];

const menuItemClass =
  "flex items-center text-sm gap-x-2 py-2 rounded-md w-full " +
  "hover:bg-mainLight hover:text-mainDark transition-colors cursor-pointer";
//Tab list design 



type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
   const pathname = usePathname();
    
  return (
    <div
      className={`
        h-full w-full bg-mainBg flex flex-col
        gap-y-8 transition-all duration-300 ${isOpen ? "p-4": "py-4 px-2"}
      `}
    >

        <div className="flex items-center justify-between border-b border-mainNeutral pb-3.5">

                {isOpen && (
                <Image
                    src="/images/JgcLogoMain.svg"
                    alt="JameroGroupOfCompanies"
                    width={150}
                    height={50}
                    priority
                />
                )}

                <button
                onClick={onToggle}
                className={`
                    text-mainLight cursor-pointer
                    ${isOpen ? "" : "mx-auto"}
                `}
                >
                {isOpen ? <XIcon /> : <MenuIcon />}
                </button>


        </div>

        
        {/* tab row 1 */}

            <div className="flex flex-col gap-y-6 items-start w-full">
                {MENU_SECTIONS.map((section) => (
                    
                    <div key={section.title} className="w-full">
                        {isOpen && (
                            <h6 className="text-sm text-mainNeutral mb-1 py-2">
                            {section.title}
                            </h6>
                        )}

                        <ul className="flex flex-col gap-y-2 w-full text-mainLight font-semibold">
                            {section.items.map(({ label, icon: Icon, path }) => {
                                const isActive = pathname === path;

                                return (
                                <li key={label}>
                                    <Link
                                    href={path}
                                    className={`
                                        ${menuItemClass}
                                        ${isOpen ? "px-3" : "justify-center"}
                                        ${isActive ? "bg-mainLight text-mainDark" : ""}
                                    `}
                                    >
                                    <Icon className="text-mainhighlight shrink-0" />
                                    {isOpen && <span>{label}</span>}
                                    </Link>
                                </li>
                                );
                            })}
                        </ul>

                    </div>
                ))}
            </div>



           
    </div>
  );
}
