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

type CreateModalProps = {
  onClose: () => void
}

export default function CreateBonusModal({ onClose }: CreateModalProps) {
    const [showProcessing, setShowProcessing] = useState(false);
  const { data: bonusRules, isLoading } = useGetAllBonusRules()
  const generateBonusMutation = useGenerateBonus()

  // ✅ Form state (typed)
  const [form, setForm] = useState<GenerateBonusInput>({
    bonusRuleId: 0,
    releasePeriod: "",
    asOfDate: ""
  })

  // ✅ Zod error state (typed)
  const [errors, setErrors] =
    useState<ZodFormattedError<GenerateBonusInput> | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: name === "bonusRuleId" ? Number(value) : value
    }))

    // clear error for this field
    if (errors) {
      setErrors(prev =>
        prev
          ? {
              ...prev,
              [name]: undefined
            }
          : null
      )
    }
  }

  function handleGenerate() {
    const result = GenerateBonusSchema.safeParse(form)
    if (!result.success) {
      setErrors(result.error.format())
      return
    }
    setShowProcessing(true);
    setErrors(null)
    generateBonusMutation.mutate(result.data, {
      onSuccess: async  () => {
        await delay(800)
        onClose()
        setShowProcessing(false)
      },
      onError: async () => {
        await delay(800)
        setShowProcessing(false)
      }
    })
  }

  return (
    <div className="relative">
      {/* Processing Overlay */}
      {showProcessing && (
        <ProcessingOverlay message="Generating employee bonus…" />
      )}
  
      <div className="flex flex-col gap-5 p-6 bg-white rounded-xl shadow-lg">
  
        {/* Header */}
        <div className="border-b pb-3">
       
          <p className="text-sm text-gray-500">
            Select bonus rule and payroll period
          </p>
        </div>
  
        {/* BONUS RULE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bonus Rule
          </label>
          <select
            name="bonusRuleId"
            value={form.bonusRuleId}
            onChange={handleChange}
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
  
          {errors?.bonusRuleId?._errors?.[0] && (
            <p className="mt-1 text-xs text-red-600">
              {errors.bonusRuleId._errors[0]}
            </p>
          )}
        </div>
  
        {/* PERIODS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  
          {/* RELEASE PERIOD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Period
            </label>
            <input
              type="month"
              name="releasePeriod"
              value={form.releasePeriod}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2
                ${errors?.releasePeriod
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
                }`}
            />
  
            {errors?.releasePeriod?._errors?.[0] && (
              <p className="mt-1 text-xs text-red-600">
                {errors.releasePeriod._errors[0]}
              </p>
            )}
          </div>
  
          {/* AS OF DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              As Of Date
            </label>
            <input
              type="date"
              name="asOfDate"
              value={form.asOfDate}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2
                ${errors?.asOfDate
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
                }`}
            />
  
            {errors?.asOfDate?._errors?.[0] && (
              <p className="mt-1 text-xs text-red-600">
                {errors.asOfDate._errors[0]}
              </p>
            )}
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
