"use client";
import { useFetchBranchesByCompany, useFetchCompanies } from "@/app/hooks/useAllowance";
import { useState } from "react";

const ALLOWANCE_URL = process.env.NEXT_PUBLIC_ALLOWANCE_URL;

interface props{
selectedMonth:string;
}
export default function ViewModalPrintAllowance({selectedMonth}:props){
      const [selectedCompany, setSelectedCompany] = useState<string>("");
      const [selectedBranch, setSelectedBranch] = useState<string>("");
      const { data: companies = [] } = useFetchCompanies();
      const { data: branches = [] } = useFetchBranchesByCompany(selectedCompany);
 

    return(
        <div className="p-4">

                <div className="grid gap-y-1 mb-4">
                    <label className="text-sm font-semibold">Select Company</label>
                    <select
                    value={selectedCompany}
                    onChange={(e) => {
                        setSelectedCompany(e.target.value);
                        setSelectedBranch("");
                    }}
                    className="border border-gray-400 px-4 py-2.5 rounded-lg">
                    <option value="">-- Choose Company --</option>
                    {companies.map((company) => (
                        <option
                        key={company.CompanyCode}
                        value={company.CompanyCode}>
                        {company.CompanyName}
                        </option>
                    ))}
                    </select>
                </div>


                {selectedCompany && (
                    <div className="grid gap-y-1 mb-4">
                    <label className="text-sm font-semibold">Select Branch</label>
                    <select
                        value={selectedBranch}
                        onChange={(event) =>
                        setSelectedBranch(event.target.value)
                        }
                        className="border border-gray-400 px-4 py-2.5 rounded-lg">
                        <option value="">
                        All branches
                        </option>

                        {branches.map((branch) => (
                        <option
                            key={branch.branchCode}
                            value={branch.branchCode}
                        >
                            {branch.branchCode}
                        </option>
                        ))}
                    </select>
                    </div>
                )}

                <div className="py-4 flex justify-end border-t border-slate-300">
                    <button
                     onClick={() => {

                         const params = new URLSearchParams({
                            month: selectedMonth,
                            company: selectedCompany,
                            });

                            if (selectedBranch) {
                            params.set("branch", selectedBranch);
                            }


                            window.open(`${ALLOWANCE_URL}/print_allowance_before_save?${params.toString()}`, "_blank");
                        }}
                    className="bg-green-800 text-white px-8 py-2.5 rounded hover:bg-green-500 mt-2">Print</button>
                </div>


        </div>
    );
}