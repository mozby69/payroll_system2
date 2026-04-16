"use client"

import { useApproveBonus, useGetBonusSummary, useRejectBonus, useReleaseBonus } from "@/app/hooks/useBonus"
import { statusBadge } from "@/app/helper/statusBadge"
import { BookOpenCheck, Eye } from "lucide-react"
import { useState } from "react"
import RequestModal from "../Modal"
import ViewArchiveModal from "./modals/ViewArchiveModal"
import toast from "react-hot-toast"
import SweetAlert from "../Swal"
import { BonusSummaryType } from "@/app/types/bonusType"
import { useAuth } from "../UserContext"


export default function BonusArchivePage() {
  const { data: bonusSummary, isLoading, error } = useGetBonusSummary();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | undefined>();

  const {hasPermission} =useAuth();

  const approve = useApproveBonus();
  const reject = useRejectBonus();
  const release = useReleaseBonus();

  const handleViewArchive = (id: number) =>{
      setIsViewModalOpen(true)
      setSelectedId(id);
  }

  const handleApproveBonus = (summary: BonusSummaryType) => {
    SweetAlert.confirmationAlert(
      "Are you sure?", 
      `Are you sure you want to approve this bonus ${summary.bonusRule.name}  ? This action cannot be undone.`,
      ()=>{ 
        approve.mutate(summary.id, {
          onSuccess: (data) => {
            toast.success(data.message, {
              position: "top-center",
            });
          }
        })
      } )
   
  }

  const handleReleaseBonus = (summary: BonusSummaryType) => {
    SweetAlert.confirmationAlert(
      "Are you sure?", 
      `Are you sure you want to release this bonus ${summary.bonusRule.name}  ? This action cannot be undone.`,
      ()=>{ 
        release.mutate(summary.id, {
          onSuccess: (data) => {
            toast.success(data.message, {
              position: "top-center",
            });
          }
        })
      } )
   
  }


  const handleRejectBonus = (summary: BonusSummaryType) => {
    SweetAlert.confirmationAlert(
      "Are you sure?", 
      `Are you sure you want to reject this bonus ${summary.bonusRule.name}  ? This action cannot be undone.`,
      ()=>{ 
        reject.mutate(summary.id, {
          onSuccess: (data) => {
            toast.success(data.message, {
              position: "top-center",
            });
          }
        })
      } )
   
  }


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
              <th className="px-5 py-3 font-medium">Bonus Code</th>
              <th className="px-5 py-3 font-medium">Bonus Name</th>
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-5 py-3 font-medium">Release Period</th>
              <th className="px-5 py-3 font-medium">Employees</th>
              <th className="px-5 py-3 font-medium text-right">
                Total Amount
              </th>
              <th className="px-5 py-3 font-medium text-center">
                Status
              </th>
              <th className="px-5 py-3 font-medium text-center">Action</th>

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
                        <span
                        className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700"
                        >
                        {summary.companyCode}
                        </span>
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
                <td className="px-5 py-3 text-gray-600">
                <div className="flex items-center gap-2">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                                  text-blue-700 bg-blue-50 hover:bg-blue-100 
                                  border border-blue-200 rounded-md 
                                  transition-colors duration-200"
                        onClick={()=>handleViewArchive(summary.id)}
                      >
                        <Eye size={15} />
                        View
                      </button>
                      {(hasPermission("BONUS_APPROVE") || hasPermission("BONUS_RELEASE")) && (
                        <div className="flex gap-2">
                           {hasPermission("BONUS_APPROVE") && (
                              <button
                              disabled={summary.status!=="PENDING"}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                                        text-emerald-700 bg-emerald-50 hover:bg-emerald-100 
                                        border border-emerald-200 rounded-md 
                                        transition-colors duration-200"
                              onClick={()=>handleApproveBonus(summary)}
                            >
                              <BookOpenCheck size={15} />
                              Approve
                            </button>

                           )}
                            {hasPermission("BONUS_RELEASE") && (
                              <button
                              disabled={summary.status!=="APPROVED"}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                                        text-emerald-700 bg-emerald-50 hover:bg-emerald-100 
                                        border border-emerald-200 rounded-md 
                                        transition-colors duration-200"
                              onClick={()=>handleReleaseBonus(summary)}
                            >
                              <BookOpenCheck size={15} />
                                   Release
                            </button>

                           )}
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                                      text-red-700 bg-red-50 hover:bg-red-100 
                                      border border-red-200 rounded-md 
                                      transition-colors duration-200"
                                      disabled={summary.status!=="PENDING"}
                            onClick={()=>handleRejectBonus(summary)}
                          >
                            <BookOpenCheck size={15} />
                            Reject
                          </button>
                        </div>
                          
                          
                      )}
                 </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

          {isViewModalOpen && (
            <RequestModal 
                title="Archived Bonus Summary" 
                size="xxxl"
                onClose={()=>setIsViewModalOpen(false)}>
                <ViewArchiveModal id={selectedId}/>
            </RequestModal>
          )}

    </div>
  )
}
