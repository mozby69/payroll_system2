"use client"

import { useState } from "react"
import { useGetEmployeeBonus, useResetBonus, useSubmitBonus } from "@/app/hooks/useBonus"
import RequestModal from "../Modal"
import CreateBonusModal from "./modals/CreateBonus"

export default function GenerateBonusPage() {
  const [addModal, setIsOpenAddModal] = useState(false)

  const resetBonusMutation = useResetBonus()
  const submitBonusMutation = useSubmitBonus()


  const {
    data: employeeBonuses,
    isLoading,
    error
  } = useGetEmployeeBonus()

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading employee bonuses…
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load employee bonuses
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Generated Employee Bonuses
          </h2>
          <p className="text-sm text-gray-500">
            View and generate employee bonus payouts
          </p>
        </div>
        <button
          onClick={() => submitBonusMutation.mutate()}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium
                     hover:bg-blue-700"
        >
          Submit
        </button>
    <button
          onClick={() => resetBonusMutation.mutate()}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium
                     hover:bg-blue-700"
        >
          Reset
        </button>
        <button
          onClick={() => setIsOpenAddModal(true)}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium
                     hover:bg-blue-700"
        >
          Generate Bonus
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Bonus Rule</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Tenure</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {employeeBonuses?.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No bonuses generated yet
                </td>
              </tr>
            )}

            {employeeBonuses?.map(bonus => (
              <tr
                key={`${bonus.employeeCode}-${bonus.bonusRuleId}`}
                className="border-t hover:bg-gray-50"
              >
                {/* Employee */}
                <td className="px-4 py-3">
                  {bonus.employee.Lastname},{" "}
                  {bonus.employee.Firstname}
                </td>

                {/* Rule */}
                <td className="px-4 py-3">
                  {bonus.bonusRule.name}
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  {bonus.bonusRule.bonusType}
                </td>

                {/* Amount */}
                <td className="px-4 py-3 font-semibold">
                  ₱{Number(bonus.amount).toLocaleString()}
                </td>

                {/* Tenure */}
                <td className="px-4 py-3">
                  {bonus.tenureMonths} mo
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {bonus.employee.EmploymentStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {addModal && (
        <RequestModal
          title="Generate Employee Bonus"
          size="md"
          onClose={() => setIsOpenAddModal(false)}
        >
          <CreateBonusModal
            onClose={() => setIsOpenAddModal(false)}
          />
        </RequestModal>
      )}
    </div>
  )
}
