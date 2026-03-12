import { TabItem, Tabs } from "@/app/components/Tab";
import { useCompaniesByCycle } from "@/app/hooks/useGeneral";
import { useDisplayVariance } from "@/app/hooks/useVariance";
import { Company } from "@/app/types/generalTypes";
import CompanyVariance from "@/app/ui/VarianceTab/CompanyVariance";
import GrandTotal from "@/app/ui/VarianceTab/GrandTotal";
import { useState } from "react";



interface props{
  paycode:string;
  cycle:string;
}


type VarianceTab = string;


export default function FinancialVarianceModal({paycode,cycle}:props) {
    const { data, isLoading } = useDisplayVariance();
    const [activeTab, setActiveTab] = useState<VarianceTab>("GrandTotal");

    const { data: company_data } = useCompaniesByCycle(cycle);

    const companies = company_data?.data ?? [];
    
    const tabs: TabItem<string>[] = [
      { key: "GrandTotal", label: "Grand Total" },
      ...companies.map((c: Company) => ({
        key: c.CompanyCode,
        label: c.CompanyCode
      }))
    ];
  

    
    return (
      <div className="p-4">

          <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={tabs}
            />

             {activeTab === "GrandTotal" && (
                <GrandTotal paycode={paycode}/>
              )}
            

            {companies.map((company: Company) =>
              activeTab === company.CompanyCode ? (
                <CompanyVariance
                  key={company.CompanyCode}
                  companyCode={company.CompanyCode}
                  paycode={paycode}
                />
              ) : null
            )}



      </div>
    );
  }
  