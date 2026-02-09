"use client"

import { useGetBonusSummary } from "@/app/hooks/useBonus"
import { statusBadge } from "@/app/helper/statusBadge"


export default function BonusArchivePage() {
  const { data: bonusSummary, isLoading, error } = useGetBonusSummary()

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading bonus archive…
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load bonus archive
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Bonus Archive
        </h2>
        <p className="text-sm text-gray-500">
          Historical records of generated, pending, and released bonuses
        </p>
      </div>

      {/* Archive Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-5 py-3 font-medium">Rule Code</th>
              <th className="px-5 py-3 font-medium">Rule Name</th>
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-5 py-3 font-medium">Release Period</th>
              <th className="px-5 py-3 font-medium">Employees</th>
              <th className="px-5 py-3 font-medium text-right">
                Total Amount
              </th>
              <th className="px-5 py-3 font-medium text-center">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {bonusSummary?.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-gray-500"
                >
                  No bonus archive records found
                </td>
              </tr>
            )}

            {bonusSummary?.map(summary => (
              <tr
                key={summary.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-5 py-3 font-medium text-gray-800">
                  {summary.bonusRule.code}
                </td>

                <td className="px-5 py-3 text-gray-700">
                  {summary.bonusRule.name}
                </td>
                <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                    {summary.bonusRule.companyRule.map(c => (
                        <span
                        key={c.companyCode}
                        className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700"
                        >
                        {c.companyCode}
                        </span>
                    ))}
                    </div>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {summary.releasePeriod}
                </td>

                <td className="px-5 py-3 text-gray-600">
                  {summary.totalEmployees}
                </td>

                <td className="px-5 py-3 text-right font-semibold text-gray-800">
                  ₱{Number(summary.totalAmount).toLocaleString()}
                </td>

                <td className="px-5 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                      ${statusBadge(summary.status)}`}
                  >
                    {summary.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
