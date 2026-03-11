'use client';
import Datatable from "@/app/components/Datatable";
import { Pagination } from "@/app/components/Pagination";
import SideModalLayout from "@/app/components/SideModal";
import SweetAlert from "@/app/components/Swal";
import { TabItem, Tabs } from "@/app/components/Tab";
import { useAuth } from "@/app/components/UserContext";
import { normalizeDisabledRanges } from "@/app/helper/flatPickerHelper";
import { useDebounce } from "@/app/helper/useDebounce";
import { useUpdateEmployeeSetup } from "@/app/hooks/disburse";
import { useDisabledPayrollDates, useFetchApiAttendance } from "@/app/hooks/useApiProcess";
import {  usefetchInitializePayroll, useImportBranches } from "@/app/hooks/usePreparePayroll";
import { Column, EmployeeRow } from "@/app/types/preparePayroll";
import { DateRange } from "@/app/types/utilsTypes";
import DateRangePicker from "@/app/ui/DateRangePicker";
import SelectCycle from "@/app/ui/InitializePayrollTab/SelectCycle";
import SelectDate from "@/app/ui/InitializePayrollTab/SelectDate";
import SelectPayroll from "@/app/ui/InitializePayrollTab/SelectDate";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";





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