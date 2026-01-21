"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

import { useAuth } from "../components/UserContext";
import { redirect } from "next/navigation";
import { User2 } from "lucide-react";



export default function PayrollLayout({children,}: {children: React.ReactNode;}) {
  const { user, loading } = useAuth();
  const [OpenSidebar, setOpenSideBar] = useState(true);

  if (loading) return null;
  if (!user) redirect("/login");



  return (
    <div className="flex min-h-screen">



      <aside className={`sticky top-0 h-screen 
        transition-all duration-300
        ${OpenSidebar ? "w-64" : "w-16"} 
        overflow-hidden
        shrink-0
        `}>
        <Sidebar 
        isOpen={OpenSidebar}
        onToggle={()=> setOpenSideBar(prev=> !prev)}
        />
      </aside>

      <main className="flex-1 overflow-y-auto h-screen relative isolate">


        <div className="sticky top-0 z-50 text-md flex items-center justify-end bg-mainNeutral px-8 py-2 shadow-[0px_0px_6px_4px_rgba(0,0,0,0.1)] min-h-14">
            <div className="inline-flex gap-x-2 cursor-pointer hover:scale-[1.03] transition duration-75">
              <User2 className="w-4"/>
              <h1>{user.username}</h1>
            </div>
        </div>

        <div className="flex flex-col bg-white w-full min-h-screen relative z-0">
          {children}
        </div>

      </main>

    </div>
  );
}
