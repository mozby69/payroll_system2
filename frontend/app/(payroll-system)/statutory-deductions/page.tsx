"use client";
import Datatable from "@/app/components/Datatable";
import RequestModal from "@/app/components/Modal";
import { Pagination } from "@/app/components/Pagination";
import { TabItem, Tabs } from "@/app/components/Tab";
import { useDebounce } from "@/app/helper/useDebounce";
import { useFetchSSSList } from "@/app/hooks/useStatutory";
import EditSSSData from "@/app/ModalContent/Statutory/EditSSSList";
import { Column } from "@/app/types/preparePayroll";
import { SSSProps } from "@/app/types/statutoryType";
import PagibigPage from "@/app/ui/StatutoryPage/PagibigPage";
import SSSPage from "@/app/ui/StatutoryPage/SSSPage";
import { Pencil } from "lucide-react";
import { useState } from "react";



type DeductionTab = "SSS" | "Pagibig" | "Philhealth" | "Wtax";

export default function StatutoryDeductions(){
        const [activeTab, setActiveTab] = useState<DeductionTab>("SSS");

        const tabs: TabItem<DeductionTab>[] = [
            { key: "SSS", label: "SSS" },
            { key: "Pagibig", label: "Pagibig" },
            { key: "Philhealth", label: "Philhealth" },
            { key: "Wtax", label: "Wtax" },
        ];


    return(
        <div className="p-8">
           
            <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={tabs}
            />

            {activeTab === "SSS" && (
              <SSSPage/>
              
            )}

            {activeTab === "Pagibig" && (
                <PagibigPage/>

            )}

            {activeTab === "Philhealth" && (
                <div>sdfds</div>
            )}

        </div>
    );


}