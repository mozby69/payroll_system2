"use client"

import { useState } from "react"
import { ZodFormattedError } from "zod"

import { useGenerateBonus, useGetAllBonusRules } from "@/app/hooks/useBonus"
import {
  GenerateBonusSchema,
  GenerateBonusInput
} from "@/app/schema/bonus.schema"
import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay"
import { delay } from "@/app/helper/delay"
import { useGetCompanyDetails } from "@/app/hooks/useGeneral"
import { BonusErrorResponse, InvalidEmployees } from "@/app/types/bonusType"
import axios from "axios"
import SweetAlert from "../../Swal"


function getReleasePeriodFromEligibleMonth(
  eligibleMonth: number
): string {
  const now = new Date()
  let year = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (currentMonth > eligibleMonth) {
    year += 1
  }

  const date = new Date(year, eligibleMonth , 1)
  return date.toISOString().slice(0, 7)
}


function getAsOfDateFromEligibleMonth(
  eligibleMonth: number
): string {
  const now = new Date()
  let year = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (currentMonth > eligibleMonth) {
    year += 1
  }
  const date = new Date(year, eligibleMonth, 0)
  return date.toISOString().slice(0, 10)
}


type CreateModalProps = {
  onClose: () => void
}

export default function CreateBonusModal({ onClose }: CreateModalProps) {
  const [showProcessing, setShowProcessing] = useState(false)
  const [lockDates, setLockDates] = useState(false)
  const [invalidDataEmployees, setInvalidEmployees] = useState<InvalidEmployees[]>([])


  const { data: bonusRules } = useGetAllBonusRules()
  const {data: companyDetails} = useGetCompanyDetails();
  const generateBonusMutation = useGenerateBonus()
  
  const [form, setForm] = useState<GenerateBonusInput>({
    bonusRuleId: 0,
    company: "",
    releasePeriod: "",
    asOfDate: "",
    generateDate: ""
  })

  const [errors, setErrors] =
    useState<ZodFormattedError<GenerateBonusInput> | null>(null)



    function handleChange(
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
      const { name, value, type, checked } = e.target as HTMLInputElement
    
      setForm(prev => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
              ? value === "" ? 0 : Number(value)
              : value
      }))
    }
    

    function handleBonusRuleChange(
      e: React.ChangeEvent<HTMLSelectElement>
    ) {
      const ruleId = Number(e.target.value)
      const rule = bonusRules?.find(r => r.id === ruleId)
    
      if (!rule || ruleId === 0) {
        setForm(prev => ({
          ...prev,
          bonusRuleId: 0,
          releasePeriod: "",
          asOfDate: ""
        }))
        setLockDates(false)
        return
      }
    
      setForm(prev => ({
        ...prev, 
        bonusRuleId: ruleId,
        releasePeriod: getReleasePeriodFromEligibleMonth(
          rule.eligibleMonth
        ),
        asOfDate: getAsOfDateFromEligibleMonth(
          rule.eligibleMonth
        )
      }))
    
      setLockDates(true)
      setErrors(null)
    }
    
 

  function handleGenerate() {
    const result = GenerateBonusSchema.safeParse(form)

    if (!result.success) {
      setErrors(result.error.format())
      return
    }

    setErrors(null)
    setShowProcessing(true)

    generateBonusMutation.mutate(result.data, {
      onSuccess: async () => {
        await delay(800)
        setShowProcessing(false)
        onClose()
      },
      onError: (error) => {
        if (!axios.isAxiosError<BonusErrorResponse>(error)) return
        const data = error.response?.data
        if (!data) return
        if (data.code === "INVALID_BONUS_AMOUNT") {
          setInvalidEmployees(data.invalidEmployees)
        }
        if(data.code === "PENDING_BONUS"){
          SweetAlert.errorAlert(
            "Bonus Generation Blocked",
            data.message,
          )
        }

        setTimeout(() => {
          setShowProcessing(false)
        }, 800)
      }
      
      
    })
  }



  return (
    <div className="relative">
      {showProcessing && (
        <ProcessingOverlay message="Generating employee bonus…" />
      )}

      <div className="flex flex-col gap-5 p-6 bg-white rounded-xl shadow-lg">
        <div className="border-b pb-3">
          <p className="text-sm text-gray-500">
            Select bonus rule and payroll period
          </p>
        </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> 
         {/* Generate Date */}
        <div  >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generate Date
            </label>
            <input
              type="date"
              name="generateDate"
              value={form.generateDate}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm
                ${errors?.generateDate
                  ? "border-red-500"
                  : "border-gray-300"
                }`}
            />
            {errors?.generateDate?._errors?.[0] && ( <p className="mt-1 text-xs text-red-600"> {errors.generateDate._errors[0]} </p> )}
          </div>
          {/* Company */}
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Company
  </label>

  <select
    name="company"
    value={form.company}
    onChange={handleChange}
    className={`w-full rounded-md border px-3 py-2 text-sm
      ${errors?.company
        ? "border-red-500 focus:ring-red-400"
        : "border-gray-300 focus:ring-blue-500"
      } focus:outline-none focus:ring-2`}
  >
    <option value="">Select Company</option>

    {companyDetails?.map(company => (
      <option
        key={company.CompanyCode}
        value={company.CompanyCode}
      >
       {company.CompanyCode} - {company.CompanyName}
      </option>
    ))}
  </select>

  {errors?.company?._errors?.[0] && (
    <p className="mt-1 text-xs text-red-600">
      {errors.company._errors[0]}
    </p>
  )}
</div>

    
    </div>
            {/* BONUS RULE */}
            <div >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bonus Rule
          </label>

          <select
            value={form.bonusRuleId}
            onChange={handleBonusRuleChange}
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2
              ${errors?.bonusRuleId
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-500"
              }`}
          >
            <option value={0}>Select Bonus Rule</option>
            {bonusRules?.map(rule => (
              <option key={rule.id} value={rule.id}>
                {rule.name}
              </option>
            ))}
          </select>
          {errors?.bonusRuleId?._errors?.[0] && ( <p className="mt-1 text-xs text-red-600"> {errors.bonusRuleId._errors[0]} </p> )}
        </div> 

        {/* PERIODS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Period
            </label>
            <input
              type="month"
              name="releasePeriod"
              value={form.releasePeriod}
              onChange={handleChange}
              disabled={lockDates}
              className={`w-full rounded-md border px-3 py-2 text-sm
                ${lockDates ? "bg-gray-100 cursor-not-allowed" : ""}
                ${errors?.releasePeriod
                  ? "border-red-500"
                  : "border-gray-300"
                }`}
            />
          {errors?.releasePeriod?._errors?.[0] && ( <p className="mt-1 text-xs text-red-600"> {errors.releasePeriod._errors[0]} </p> )}

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              As Of Date
            </label>
            <input
              type="date"
              name="asOfDate"
              value={form.asOfDate}
              onChange={handleChange}
              disabled={lockDates}
              className={`w-full rounded-md border px-3 py-2 text-sm
                ${lockDates ? "bg-gray-100 cursor-not-allowed" : ""}
                ${errors?.asOfDate
                  ? "border-red-500"
                  : "border-gray-300"
                }`}
            />

          {errors?.asOfDate?._errors?.[0] && ( <p className="mt-1 text-xs text-red-600"> {errors.asOfDate._errors[0]} </p> )}

          </div>
      
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            disabled={generateBonusMutation.isPending}
            onClick={handleGenerate}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generateBonusMutation.isPending ? "Processing…" : "Generate Bonus"}
          </button>
        </div>
      </div>
    </div>
  )
}
