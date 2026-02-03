import { useCreateBonusCompanyRules } from "@/app/hooks/useBonus"
import { useGetCompanyDetails } from "@/app/hooks/useGeneral"
import { CreateBonusRuleCompanyForm, createBonusRuleCompanySchema } from "@/app/schema/bonus.schema"
import { useState } from "react"
import { ZodFormattedError } from "zod"

type CreateCompanyBonusType = {
    onClose: () => void,
    bonusRuleId: number,
}



export default function CreateCompanyRulesModal( {onClose, bonusRuleId} : CreateCompanyBonusType) {
  const { data: companyDetails } = useGetCompanyDetails()
  const createMutate = useCreateBonusCompanyRules()


  const [form, setForm] = useState<CreateBonusRuleCompanyForm>({
    bonusRuleId: bonusRuleId,
    companyCode: ""
  })

  const [errors, setErrors] =  useState<ZodFormattedError<CreateBonusRuleCompanyForm> | null>(null)

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


  function handleCreateCompany (){
    const result = createBonusRuleCompanySchema.safeParse(form)
    console.log("submit")
    if (!result.success) {
        setErrors(result.error.format())
        return
      }
      createMutate.mutate(result.data, {
        onSuccess: async () => {
            onClose()
          },
          onError: (error) => {
            console.log("error: ", error)
          }
          
      })



  }

  return (
    <div>
      {/* Company */}
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
              {company.CompanyCode} - {company.CompanyName}
            </option>
          ))}
        </select>

        {errors?.companyCode?._errors?.[0] && (
          <p className="mt-1 text-xs text-red-600">
            {errors.companyCode._errors[0]}
          </p>
        )}
      </div>

      <button onClick={handleCreateCompany} className="p-2 bg-blue-900 text-white"> Add</button>
    </div>
  )
}
