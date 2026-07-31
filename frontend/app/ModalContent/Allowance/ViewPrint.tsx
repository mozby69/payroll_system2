"use client";

import SweetAlert from "@/app/components/Swal";
import { useFetchBranchesByCompany, useFetchCompanies } from "@/app/hooks/useAllowance";
import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ALLOWANCE_URL = process.env.NEXT_PUBLIC_ALLOWANCE_URL;

interface Props {
  selectedMonth: string;
}

export default function CompanyBranchSelector({ selectedMonth }: Props) {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const { data: companies = [] } = useFetchCompanies();
  const { data: branches = [] } = useFetchBranchesByCompany(selectedCompany);
  const [loading, setLoading] = useState(false);

 
  return (
    <div className="p-6 max-full bg-white rounded-lg shadow-xl">
      {loading ? (
        <ProcessingOverlay
          title="Sending Emails"
          message="Please wait while we send employee payslips. This may take a few moments."
        />
      ) : null}

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
            className="border border-gray-400 px-4 py-2.5 rounded-lg"
          >
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

      <div className="flex justify-end gap-x-2 pt-4">
        {/* <button
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
        </button> */}

        <button
          disabled={!selectedCompany}
          onClick={() => {
            const params = new URLSearchParams({
              month: selectedMonth,
              company: selectedCompany,
            });
            if (selectedBranch) {
              params.set("branch", selectedBranch);
            }

            window.open(
              `${ALLOWANCE_URL}/print_allowance?${params.toString()}`,
              "_blank"
            );
          }}
          className="bg-green-800 hover:bg-green-600 hover:cursor-pointer text-white py-2.5 px-6 rounded disabled:bg-gray-400"
        >
          Print
        </button>

        <button
          disabled={!selectedCompany || loading}
          onClick={async () => {
            setLoading(true);

            try {
              const response = await fetch(
                `${API_URL}/allowance/send-allowance-email`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    month: selectedMonth,
                    company: selectedCompany,
                    ...(selectedBranch
                      ? {
                        branch: selectedBranch,
                      }
                      : {}),
                  }),
                }
              );

              const result: {
                message?: string;
                sent?: number;
                failed?: number;
                skipped?: number;
              } = await response.json();

              if (!response.ok) {
                throw new Error(
                  result.message ??
                  "Failed to send allowance emails"
                );
              }

              SweetAlert.successAlert(
                `Emails sent: ${result.sent ?? 0}, failed: ${result.failed ?? 0
                }, skipped: ${result.skipped ?? 0}`
              );
            } catch (error: unknown) {
              console.error(error);

              SweetAlert.errorAlert(
                error instanceof Error
                  ? error.message
                  : "Failed to send emails"
              );
            } finally {
              setLoading(false);
            }
          }}
          className="bg-orange-500 hover:bg-orange-400 text-white py-2.5 px-6 rounded disabled:bg-gray-400"
        >
          {loading ? "Sending..." : "Send Email"}
        </button>

      </div>


    </div>
  );
}