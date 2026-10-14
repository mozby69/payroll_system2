'use client';
import { TabItem, Tabs } from "@/app/components/Tab";
import ArchivedConversionTab from "@/app/ui/ConversionTab/archiveTab";
import ConversionTab from "@/app/ui/ConversionTab/conversionTab";
import { useState } from "react";



type conversionTab = "Conversion" | "Archived";

export default function ConversionPage() {
  const [activeTab, setActiveTab] = useState<conversionTab>("Conversion");


  const tabs: TabItem<conversionTab>[] = [
    { key: "Conversion", label: "Conversion" },
    { key: "Archived", label: "Archived" },

  ];


 
  return (
    <>

      <div className="p-8">


        <div className="">
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={tabs}
          />
        </div>


          {activeTab === "Conversion" && (
             <ConversionTab/>
          )}

          {activeTab === "Archived" && (
              <ArchivedConversionTab/>
          )}

      
      </div>

    </>
  );
}