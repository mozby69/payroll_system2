
import CompanyVariance from "@/app/ui/VarianceTab/CompanyVariance";


interface props{
  paycode:string;
  cycle:string;
  company_id?:string;
}


export default function FinancialVarianceModal({paycode,cycle,company_id}:props) {

    return (
      <div className="p-4">
          <h1 className="font-semibold text-lg mb-2 text-mainGray">{paycode} - {cycle} - {company_id}</h1>
        
            <CompanyVariance
                  companyCode={company_id!}
                  paycode={paycode}
                />

      </div>
    );
  }
  