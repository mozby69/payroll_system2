import { useDeleteBonusCompanyRUles, useGetBonusCompanyRules } from "@/app/hooks/useBonus"
import { BonusCompanyRule } from "@/app/types/bonusType";
import { useState } from "react";
import RequestModal from "../../Modal";
import CreateCompanyRulesModal from "./CreateCompanyBonus";

type BonusRuleCompanyModalProps = {
  initialData?: { id?: number; name?: string }
}

export default function BonusRuleCompanyModal({
  initialData
}: BonusRuleCompanyModalProps) {

  const { data, isLoading, error } =
    useGetBonusCompanyRules(initialData?.id ?? null)

  const [companyModal, setCompanyModal] = useState(false)

  const deleteMutation = useDeleteBonusCompanyRUles()

  const handleDelete = (row: BonusCompanyRule) => {
    deleteMutation.mutate(row.id, {
      onSuccess: (data) => {
        console.log(data.message)
      }
    })
  }

  if (!initialData?.id) {
    return (
      <div className="text-sm text-gray-500 p-4">
        No bonus rule selected
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 p-4">
        Loading company rules…
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 p-4">
        Failed to load company rules
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Assigned Companies
          </h2>
          <p className="text-sm text-gray-500">
            Bonus Rule: {initialData.name}
          </p>
        </div>

        <button
          onClick={() => setCompanyModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2
                     rounded-md bg-blue-600 text-white text-sm font-medium
                     hover:bg-blue-700 transition"
        >
          + Add Company
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">
                Company Code
              </th>
              <th className="px-4 py-3 font-medium">
                Company Name
              </th>
              <th className="px-4 py-3 font-medium text-right">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No companies assigned
                </td>
              </tr>
            )}

            {data?.map(row => (
              <tr
                key={row.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {row.companyDetails.CompanyCode}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {row.companyDetails.CompanyName}
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(row)}
                    className="inline-flex items-center px-3 py-1.5
                               text-xs font-medium text-red-600
                               border border-red-200 rounded-md
                               hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {companyModal && (
        <RequestModal
          size="sm"
          title="Assign Company to Bonus Rule"
          onClose={() => setCompanyModal(false)}
        >
          <CreateCompanyRulesModal
            bonusRuleId={initialData.id}
            onClose={() => setCompanyModal(false)}
          />
        </RequestModal>
      )}

    </div>
  )
}
