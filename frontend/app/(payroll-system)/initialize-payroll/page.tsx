'use client';

import { TabItem, Tabs } from "@/app/components/Tab";
import SelectCycle from "@/app/ui/InitializePayrollTab/SelectCycle";
import SelectDate from "@/app/ui/InitializePayrollTab/SelectDate";
import { useState } from "react";


type InitializeTab = "Cycle" | "Date";

export default function InitilizePayroll(){
  const [activeTab, setActiveTab] = useState<InitializeTab>("Cycle");
  const [branchCycle, setBranchCycle] = useState<string>("");

  
  const tabs: TabItem<InitializeTab>[] = [
    { key: "Cycle", label: "Select Cycle" },
    { key: "Date", label: "Select Date" },
    ];




  

    return (
        <div className="p-8">

              <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={tabs}
            />



            {activeTab === "Cycle" && (
                  <SelectCycle branchCycle={branchCycle} setBranchCycle={setBranchCycle} />
            )}

            {activeTab === "Date" && (
                 <SelectDate branchCycle={branchCycle}   />
            )}
             
        





        </div>
    );
}