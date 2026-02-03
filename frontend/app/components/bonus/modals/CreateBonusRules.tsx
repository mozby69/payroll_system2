"use client"

import { useState } from "react"
import { ZodFormattedError } from "zod"

import {
  CreateBonusRuleForm,
  BonusTypeEnum,
  FormulaTypeEnum,
  bonusRuleBaseSchema
} from "@/app/schema/bonus.schema"

import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay"
import { delay } from "@/app/helper/delay"
import { useCreateBonusRules, useUpdateBonusRules } from "@/app/hooks/useBonus"
import { InputField, SelectField } from "../../FormInputs"
import toast from "react-hot-toast"

type BonusRuleModalProps = {
  mode: "create" | "edit"
  onClose: () => void
  initialData?: CreateBonusRuleForm & {id?: number}
}

export default function CreateBonusRulesModal({ mode, onClose, initialData }: BonusRuleModalProps) {
  const createBonusRuleMutation = useCreateBonusRules()
  const updateBonusRuleMutation = useUpdateBonusRules()
  const [showProcessing, setShowProcessing] = useState(false)

  const isEdit = mode === "edit"

  const [form, setForm] = useState<CreateBonusRuleForm>({
    code: initialData?.code ?? "",
    name: initialData?.name ?? "",
    bonusType: initialData?.bonusType ?? null,
    eligibleMonth: initialData?.eligibleMonth ?? 1,
    minTenureMonths: initialData?.minTenureMonths ?? 0,
    formulaType: initialData?.formulaType ?? null,
    taxable: initialData?.taxable ?? false
  })

  const [errors, setErrors] =
    useState<ZodFormattedError<CreateBonusRuleForm> | null>(null)

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
                : value === ""
                  ? null
                  : value
        }))
      }
      

      async function handleSubmit() {
        const result = bonusRuleBaseSchema.safeParse(form)
      
        if (!result.success) {
          setErrors(result.error.format())
          return
        }
      
        setErrors(null)
        setShowProcessing(true)
      
        if (isEdit) {
          // 🔵 UPDATE
          updateBonusRuleMutation.mutate(
            {
              id: initialData!.id!, // guaranteed in edit mode
              payload: result.data
            },
            {
              onSuccess: async () => {
             
                await delay(800)
                toast.success("Bonus rule updated successfully", {
                  position: "top-center",
                });
                setShowProcessing(false)
                onClose()
              },
              onError: async () => {
                await delay(800)
                setShowProcessing(false)
              }
            }
          )
        } else {
          // 🟢 CREATE
          createBonusRuleMutation.mutate(result.data, {
            onSuccess: async () => {
              await delay(800)
              toast.success("Bonus rule added successfully", {
                position: "top-center",
              });
              
              setShowProcessing(false)
              onClose()
            },
            onError: async () => {
              await delay(800)
              setShowProcessing(false)
            }
          })
        }
      }

  return (
    <div className="relative">
      {showProcessing && (
        <ProcessingOverlay message="Saving bonus rule…" />
      )}

      <div className="bg-white rounded-xl shadow-lg p-3 space-y-3">

        {/* Header */}
        <div className="border-b pb-3">
         
          <p className="text-sm text-gray-500">
            Configure how bonuses are computed
          </p>
        </div>

        {/* Code */}
        <InputField
          label="Rule Code"
          name="code"
          value={form.code}
          error={errors?.code?._errors?.[0]}
          onChange={handleChange}
        />

        {/* Name */}
        <InputField
          label="Rule Name"
          name="name"
          value={form.name}
          error={errors?.name?._errors?.[0]}
          onChange={handleChange}
        />

        {/* Bonus Type */}
        <SelectField
          label="Bonus Type"
          name="bonusType"
          value={form.bonusType ?? ""}
          error={errors?.bonusType?._errors?.[0]}
          onChange={handleChange}
          options={BonusTypeEnum.options}
        />

        {/* Formula */}
        <SelectField
          label="Formula"
          name="formulaType"
          value={form.formulaType ?? ""}
          error={errors?.formulaType?._errors?.[0]}
          onChange={handleChange}
          options={FormulaTypeEnum.options}
        />

        {/* Numbers */}
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Eligible Month"
            name="eligibleMonth"
            type="number"
            value={form.eligibleMonth}
            error={errors?.eligibleMonth?._errors?.[0]}
            onChange={handleChange}
          />

          <InputField
            label="Min Tenure (Months)"
            name="minTenureMonths"
            type="number"
            value={form.minTenureMonths}
            error={errors?.minTenureMonths?._errors?.[0]}
            onChange={handleChange}
          />
        </div>

        {/* Taxable */}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="taxable"
            checked={form.taxable}
            onChange={handleChange}
          />
          Taxable Bonus
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={createBonusRuleMutation.isPending}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md
                       hover:bg-blue-700 disabled:opacity-50"
          >
            {createBonusRuleMutation.isPending ? "Saving…" : "Save Rule"}
          </button>
        </div>
      </div>
    </div>
  )
}
