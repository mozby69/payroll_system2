"use client"

import { useState } from "react"
import { useDeleteBonusRules, useGetAllBonusRules } from "@/app/hooks/useBonus"
import RequestModal from "../Modal"
import CreateBonusRulesModal from "./modals/CreateBonusRules"
import { BonusRule } from "@/app/schema/bonus.schema"
import BonusRuleCompanyModal from "./modals/BonusRuleCompanyModal"
import toast from "react-hot-toast"
import { Building2, Edit, Trash2 } from "lucide-react"
import SweetAlert from "../Swal"

export default function BonusRulesPage() {
  const [addModal, setIsOpenAddModal] = useState(false)
  const [companyModal, setCompanyModal] = useState(false)
  const { data: bonusRules, isLoading, error } = useGetAllBonusRules()
  const deleteMutation = useDeleteBonusRules()
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

  const handleDelete = (rules : BonusRule) => {
    SweetAlert.confirmationAlert(
      "Are you sure?", 
      `Are you sure you want to delete this bonus rule ${rules.name} ? This action cannot be undone.`,
      ()=>{
        deleteMutation.mutate(rules.id , {
          onSuccess:  (data)=>{
            toast.success(data.message, {
              position: "top-center",
            });
          }
        })
      }
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
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Eligible Month</th>
              <th className="px-4 py-3 font-medium">Min Tenure (Years)</th>
              <th className="px-4 py-3 font-medium">Formula</th>
              <th className="px-4 py-3 font-medium text-center">Action</th>
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
                <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                    {rule.companyRule?.map(c => (
                        <span
                        key={c.companyCode}
                        className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700"
                        >
                        {c.companyCode}
                        </span>
                    ))}
                    </div>
                </td>
                <td className="px-4 py-3 text-center">{rule.eligibleMonth}</td>
                <td className="px-4 py-3 text-center">
                  {rule.minTenureYear}
                </td>
                <td className="px-4 py-3">{rule.formulaType}</td>
                <td className="px-4 py-3">
  <div className="flex items-center">

    {/* Edit */}
    <button
      onClick={() => {
        setSelectedRule(rule)
        setIsOpenAddModal(true)
      }}
      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium 
                 rounded-l-md
                 bg-blue-50 text-blue-700 
                 hover:bg-blue-100 
                 transition-colors"
    >
      <Edit size={15} />
      Edit
    </button>

    {/* Company */}
    <button
      onClick={() => {
        setSelectedRule(rule)
        setCompanyModal(true)
      }}
      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                 bg-emerald-50 text-emerald-700 
                 hover:bg-emerald-100 
                 transition-colors"
    >
      <Building2 size={15} />
      Company
    </button>

    {/* Delete */}
    <button
      onClick={() => handleDelete(rule)}
      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium 
                 rounded-r-md
                 bg-red-50 text-red-700 
                 hover:bg-red-100 
                 transition-colors"
    >
      <Trash2 size={15} />
      Delete
    </button>

  </div>
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

      {companyModal && (
        <RequestModal 
          title="Configure Company Bonus Rules" 
          size="md"
          nested = {true}
          onClose={() => {
            setCompanyModal(false)
            setSelectedRule(null)
          }}>
             <BonusRuleCompanyModal  initialData={selectedRule ?? undefined} />
          </RequestModal>

      )}

    </div>
  )
}
