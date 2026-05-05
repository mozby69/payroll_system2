"use client";

import { useFetchBranchesByCompany, useFetchCompanies } from "@/app/hooks/useAllowance";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Props {
    selectedMonth: string;
  }

export default function CompanyBranchSelector({ selectedMonth }:Props) {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const { data: companies = [] } = useFetchCompanies();
  const { data: branches = [] } = useFetchBranchesByCompany(selectedCompany);


  const preselectedbranch = branches.length === 1 ? branches[0].branchCode : selectedBranch;

  return (
    <div className="p-6 max-full bg-white rounded-lg shadow-xl">

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
            value={preselectedbranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            disabled={branches.length === 1}
            className="border border-gray-400 px-4 py-2.5 rounded-lg">
            <option value="" disabled>-- Choose Branch --</option>
            {branches.map((branch) => (
              <option key={branch.branchCode} value={branch.branchCode}>
                {branch.branchCode}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-end gap-x-2 pt-4">
        <button
          disabled={!selectedCompany || !preselectedbranch}
          onClick={() => {
            const printPath = `/print?month=${selectedMonth}&company=${selectedCompany}&branch=${preselectedbranch}`;
            window.open(
              `${API_URL}/general/print?path=${encodeURIComponent(
                printPath
              )}&download=true`,
              "_blank"
            );
          }}
          className="bg-blue-800 hover:bg-blue-600 text-white rounded px-4 py-2.5 disabled:bg-gray-400">
          Download
        </button>
      
        <button
          disabled={!selectedCompany || !preselectedbranch}
          onClick={() => {
              const printPath = `/print?month=${selectedMonth}&company=${selectedCompany}&branch=${preselectedbranch}`;
              window.open(
              `${API_URL}/general/print?path=${encodeURIComponent(printPath)}`,
              "_blank"
              );
          }}
          className="bg-green-800 hover:bg-green-600 hover:cursor-pointer text-white py-2.5 px-6 rounded disabled:bg-gray-400">
          Print
          </button>

          <button disabled={!selectedCompany || !preselectedbranch}
            onClick={async () => {
              try {
                const res = await fetch(
                  `${API_URL}/allowance/send-allowance-email`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      month: selectedMonth,
                      company: selectedCompany,
                      branch: preselectedbranch,
                    }),
                  }
                );

                const data = await res.json();

                if (!res.ok) {
                  throw new Error(data.message);
                }

                alert("Emails sent successfully");
              } catch (err) {
                console.error(err);
                alert("Failed to send emails");
              }
            }}
            className="bg-orange-500 hover:bg-orange-400 text-white py-2.5 px-6 rounded disabled:bg-gray-400">
            Send Email
          </button>
      </div>

      
    </div>
  );
}