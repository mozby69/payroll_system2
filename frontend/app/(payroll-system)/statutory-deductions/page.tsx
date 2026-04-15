"use client";

import { TabItem, Tabs } from "@/app/components/Tab";
import PagibigPage from "@/app/ui/StatutoryPage/PagibigPage";
import PhilhealthPage from "@/app/ui/StatutoryPage/PhilHealthPage";
import SSSPage from "@/app/ui/StatutoryPage/SSSPage";
import WTaxPage from "@/app/ui/StatutoryPage/WtaxPage";
import { useState } from "react";



type DeductionTab = "SSS" | "Pagibig" | "Philhealth" | "Wtax";

export default function StatutoryDeductions() {
    const [activeTab, setActiveTab] = useState<DeductionTab>("SSS");

    const tabs: TabItem<DeductionTab>[] = [
        { key: "SSS", label: "SSS" },
        { key: "Pagibig", label: "Pagibig" },
        { key: "Philhealth", label: "Philhealth" },
        { key: "Wtax", label: "WHTax" },
    ];


    return (
        <div className="p-8">


            <div className="py-4">
                <Tabs
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    tabs={tabs}
                />
            </div>

            {activeTab === "SSS" && (
                <SSSPage />
            )}

            {activeTab === "Pagibig" && (
                <PagibigPage />

            )}

            {activeTab === "Philhealth" && (
                <PhilhealthPage />
            )}

            {activeTab === "Wtax" && (
                <WTaxPage />
            )}


        </div>
    );


}