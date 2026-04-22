"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import SweetAlert from "../../Swal"

import { useGenerateBonus, useGetAllBonusRules, useGetCompanyBonusRules } from "@/app/hooks/useBonus"
import { GenerateBonusSchema, GenerateBonusInput } from "@/app/schema/bonus.schema"
import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay"
import { delay } from "@/app/helper/delay"
import { BonusErrorResponse } from "@/app/types/bonusType"
import { useAuth } from "../../UserContext"

function getReleasePeriodFromEligibleMonth(
  eligibleMonth: number,
  referenceDate: Date
): string {
  let year = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth() + 1

  if (currentMonth > eligibleMonth) year += 1

  const date = new Date(year, eligibleMonth, 1)
  return date.toISOString().slice(0, 7)
}

function getAsOfDateFromEligibleMonth(
  eligibleMonth: number,
  referenceDate: Date
): string {
  let year = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth() + 1

  if (currentMonth > eligibleMonth) year += 1

  const date = new Date(year, eligibleMonth, 0)

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export default function CreateBonusModal({ onClose }: { onClose: () => void }) {

  
    const { user } = useAuth()
    const companyId = user?.company_id ?? "";
    const { data: bonusRules = [] } = useGetCompanyBonusRules(companyId)
    

    
    const generateBonusMutation = useGenerateBonus()
  
  const [form, setForm] = useState<GenerateBonusInput>({
    bonusRuleIds: [],
    releasePeriod: "",
    asOfDate: "",
    generateDate: "",
    companyCode: companyId
  })

  const [open, setOpen] = useState(false)
  const [showProcessing, setShowProcessing] = useState(false)
  const [errors, setErrors] = useState<any>(null)
  const [lockDates, setLockDates] = useState(false)

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!e.target.closest(".bonus-dropdown")) {
        setOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value

    setForm({
      bonusRuleIds: [],
      releasePeriod: "",
      asOfDate: "",
      generateDate: value,
      companyCode: companyId
    })

    setLockDates(false)
  }

  function handleSelectRule(ruleId: number) {
    if (!form.generateDate) return

    const referenceDate = new Date(form.generateDate)
    const selectedRules = bonusRules.filter(r =>
      form.bonusRuleIds.includes(r.id)
    )

    const referencePeriod = selectedRules.length
      ? getReleasePeriodFromEligibleMonth(
          selectedRules[0].eligibleMonth,
          referenceDate
        )
      : null

    const clickedRule = bonusRules.find(r => r.id === ruleId)
    if (!clickedRule) return

    const clickedPeriod = getReleasePeriodFromEligibleMonth(
      clickedRule.eligibleMonth,
      referenceDate
    )

    // ❌ prevent different period
    if (referencePeriod && clickedPeriod !== referencePeriod) return

    let updated = [...form.bonusRuleIds]

    if (updated.includes(ruleId)) {
      updated = updated.filter(id => id !== ruleId)
    } else {
      updated.push(ruleId)
    }

    const firstRule = bonusRules.find(r => r.id === updated[0])

    setForm(prev => ({
      ...prev,
      bonusRuleIds: updated,
      releasePeriod: firstRule
        ? getReleasePeriodFromEligibleMonth(
            firstRule.eligibleMonth,
            referenceDate
          )
        : "",
      asOfDate: firstRule
        ? getAsOfDateFromEligibleMonth(
            firstRule.eligibleMonth,
            referenceDate
          )
        : ""
    }))

    setLockDates(true)
  }

  function handleGenerate() {
    const result = GenerateBonusSchema.safeParse(form)

    if (!result.success) {
      setErrors(result.error.format())
      return
    }

    setShowProcessing(true)


    generateBonusMutation.mutate(result.data, {
      onSuccess: async () => {
        await delay(800)
        setShowProcessing(false)
        onClose()
      },
      onError: async (error) => {
        setShowProcessing(false)

        if (!axios.isAxiosError<BonusErrorResponse>(error)) return

        const err = error.response?.data?.error
        if (!err) return

        if (err.code === "PENDING_BONUS") {
          SweetAlert.errorAlert("Blocked", err.message)
        }
      }
    })
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-2xl">
      {showProcessing && <ProcessingOverlay message="Generating bonus..." />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Generate Date</label>
            <input
              type="date"
              name="generateDate"
              value={form.generateDate}
              onChange={handleDateChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm
                ${errors?.generateDate
                  ? "border-red-500"
                  : "border-gray-300"}
                focus:outline-none focus:ring-2
              `}
            />

          {errors?.generateDate?._errors?.[0] && (
            <p className="mt-1 text-xs text-red-600">
              {errors.generateDate._errors[0]}
            </p>
          )}
        </div>

        {/* MULTI SELECT */}
        <div className="col-span-2 bonus-dropdown relative">
          <label className="block text-sm font-medium text-gray-600 mb-1">Bonus Rule</label>

          <div
            onClick={() => form.generateDate && setOpen(!open)}
            className={`border rounded px-2 py-2 mt-1 min-h-10 flex flex-wrap gap-1 cursor-pointer
              ${!form.generateDate && "bg-gray-100 text-gray-400 cursor-not-allowed"}
            `}
          >
            {form.bonusRuleIds.length === 0 && (
              <span className="text-gray-400 text-sm">Select rules</span>
            )}

            {form.bonusRuleIds.map(id => {
              const rule = bonusRules.find(r => r.id === id)
              return (
                <span key={id} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                  {rule?.name}
                </span>
              )
            })}
          </div>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute w-full bg-white border rounded mt-1 max-h-40 overflow-auto shadow">
              {bonusRules.map(rule => {
                const referenceDate = new Date(form.generateDate)
                const period = getReleasePeriodFromEligibleMonth(
                  rule.eligibleMonth,
                  referenceDate
                )

                const selectedRules = bonusRules.filter(r =>
                  form.bonusRuleIds.includes(r.id)
                )

                const referencePeriod = selectedRules.length
                  ? getReleasePeriodFromEligibleMonth(
                      selectedRules[0].eligibleMonth,
                      referenceDate
                    )
                  : null

                const disabled =
                  referencePeriod && period !== referencePeriod

                return (
                  <div
                    key={rule.id}
                    onClick={() => !disabled && handleSelectRule(rule.id)}
                    className={`px-3 py-2 flex justify-between text-sm
                      ${disabled ? "text-gray-400" : "hover:bg-gray-100 cursor-pointer"}
                    `}
                  >
                    <div className="flex gap-2">
                      <input
                        type="checkbox"
                        checked={form.bonusRuleIds.includes(rule.id)}
                        readOnly
                      />
                      {rule.name}
                    </div>

                    <span className="text-xs text-gray-500">{period}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* PERIOD */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Release Period</label>
          <input
            type="month"
            value={form.releasePeriod}
            disabled
            className={`w-full rounded-lg border px-3 py-2 text-sm
              ${errors?.releasePeriod
                ? "border-red-500"
                : "border-gray-300"}
              focus:outline-none focus:ring-2
            `}
          />
          {errors?.releasePeriod?._errors?.[0] && (
            <p className="mt-1 text-xs text-red-600">
              {errors.releasePeriod._errors[0]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">As Of Date</label>
          <input
            type="date"
            value={form.asOfDate}
            disabled
            className={`w-full rounded-lg border px-3 py-2 text-sm
              ${errors?.asOfDate
                ? "border-red-500"
                : "border-gray-300"}
              focus:outline-none focus:ring-2
            `}
          />
            {errors?.asOfDate?._errors?.[0] && (
            <p className="mt-1 text-xs text-red-600">
              {errors.asOfDate._errors[0]}
            </p>
          )}
        </div>
      </div>

   
        <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <p className="text-xs text-gray-400">
              Make sure all required fields are filled
            </p>
            <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600
                            hover:bg-gray-100 hover:text-gray-800 transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generateBonusMutation.isPending}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold text-white
                    bg-blue-600 hover:bg-blue-700
                    shadow-sm hover:shadow-md
                    transition-all duration-150
                    ${generateBonusMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {generateBonusMutation.isPending ? "Processing..." : "Generate Bonus"}
                </button>
            </div>
        </div>
    </div>
  )
}