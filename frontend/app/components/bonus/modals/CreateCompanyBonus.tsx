import { useCreateBonusCompanyRules } from "@/app/hooks/useBonus"
import { useGetCompanyDetails } from "@/app/hooks/useGeneral"
import { CreateBonusRuleCompanyForm, createBonusRuleCompanySchema } from "@/app/schema/bonus.schema"
import { handleApiError } from "@/app/utils/handleApiError"
import { useState } from "react"
import toast from "react-hot-toast"
import { ZodFormattedError } from "zod"

type CreateCompanyBonusType = {
    onClose: () => void,
    bonusRuleId: number,
}



export default function CreateCompanyRulesModal({
    onClose,
    bonusRuleId
  }: CreateCompanyBonusType) {
  
    const { data: companyDetails } = useGetCompanyDetails()
    const createMutate = useCreateBonusCompanyRules()
  
    const [form, setForm] = useState<CreateBonusRuleCompanyForm>({
      bonusRuleId,
      companyCode: ""
    })
  
    const [errors, setErrors] =
      useState<ZodFormattedError<CreateBonusRuleCompanyForm> | null>(null)
  
    function handleChange(
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
      const { name, value } = e.target
  
      setForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  
    function handleCreateCompany() {
      const result = createBonusRuleCompanySchema.safeParse(form)
  
      if (!result.success) {
        setErrors(result.error.format())
        return
      }
  
      createMutate.mutate(result.data, {
        onSuccess: () => {
            onClose()
            toast.success("Company added successfully", {
                position: "top-center",
              });
        },
        onError: (error) => {
          toast.error(handleApiError(error), {
            position: "top-center",
          })
        }
      })
    }
  
    return (
      <div className="space-y-6">
  
        {/* Header */}
        <div>
          <p className="text-sm text-gray-500">
            Select a company to apply this bonus rule
          </p>
        </div>
  
        {/* Form */}
        <div className="space-y-3">
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
  
            <select
              name="companyCode"
              value={form.companyCode}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 text-sm
                ${errors?.companyCode
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
                  {company.CompanyCode} — {company.CompanyName}
                </option>
              ))}
            </select>
  
            {errors?.companyCode?._errors?.[0] && (
              <p className="mt-1 text-xs text-red-600">
                {errors.companyCode._errors[0]}
              </p>
            )}
          </div>
  
        </div>
  
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
  
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md
                       text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
  
          <button
            onClick={handleCreateCompany}
            disabled={createMutate.isPending}
            className="px-4 py-2 text-sm font-medium rounded-md
                       bg-blue-600 text-white hover:bg-blue-700
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutate.isPending ? "Saving…" : "Add Company"}
          </button>
  
        </div>
      </div>
    )
  }
  