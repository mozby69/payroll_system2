"use client"

import { useState } from "react"
import { useGetAllBonusRules } from "@/app/hooks/useBonus"
import RequestModal from "../Modal"
import CreateBonusRulesModal from "./modals/CreateBonusRules"
import { BonusRule } from "@/app/schema/bonus.schema"

export default function BonusRulesPage() {
  const [addModal, setIsOpenAddModal] = useState(false)
  const { data: bonusRules, isLoading, error } = useGetAllBonusRules()
  const [selectedRule, setSelectedRule] = useState<BonusRule | null> (null)

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading bonus rules…
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load bonus rules
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Bonus Rules
          </h2>
          <p className="text-sm text-gray-500">
            Manage bonus configurations and generation
          </p>
        </div>

        <button
          onClick={() => setIsOpenAddModal(true)}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium
                     hover:bg-blue-700"
        >
          Add Bonus Rules
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Eligible Month</th>
              <th className="px-4 py-3 font-medium">Min Tenure</th>
              <th className="px-4 py-3 font-medium">Formula</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {bonusRules?.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No bonus rules found
                </td>
              </tr>
            )}

            {bonusRules?.map(rule => (
              <tr
                key={rule.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-3">{rule.code}</td>
                <td className="px-4 py-3">{rule.name}</td>
                <td className="px-4 py-3">{rule.bonusType}</td>
                <td className="px-4 py-3">{rule.eligibleMonth}</td>
                <td className="px-4 py-3">
                  {rule.minTenureMonths} mo
                </td>
                <td className="px-4 py-3">{rule.formulaType}</td>
                <td className="px-4 py-3">
                  <button 
                      onClick={()=>{
                        setSelectedRule(rule)
                        setIsOpenAddModal(true)
                      }}
                   className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {addModal && (
        <RequestModal
          title={selectedRule ? "Edit Bonus Rule" : "Create Bonus Rule"}
          size="md"
          onClose={() => {
            setIsOpenAddModal(false)
            setSelectedRule(null)
          }}
        >
          <CreateBonusRulesModal
            mode={selectedRule ? "edit" : "create"}
            initialData={selectedRule ?? undefined}
            onClose={() => {
              setIsOpenAddModal(false)
              setSelectedRule(null)
            }}
          />
        </RequestModal>
      )}

    </div>
  )
}
