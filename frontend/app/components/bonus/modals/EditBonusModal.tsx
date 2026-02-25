import { EmployeBonusType } from "@/app/types/bonusType"
import { useState } from "react"

type Props = {
  bonus: EmployeBonusType 
  onClose: () => void
}

export default function EditBonusModal({ bonus, onClose }: Props) {

  const [bonusAmount, setBonusAmount] = useState<number>(bonus.bonusAmount)
  const [loan, setLoan] = useState<number>(bonus.fchLoan)

  const netAmount = bonusAmount - loan

  const handleSave = () => {
    console.log("Updated Bonus:", {
      bonusId: bonus.bonusId,
      bonusAmount,
      loan,
      netAmount,
    })

    onClose()
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Employee Info */}
      <div className="border rounded-lg p-4 bg-gray-50 text-sm">
        <div className="font-semibold text-gray-800">
          {bonus.fullName}
        </div>
        <div className="text-gray-500">
          Employee Code: {bonus.employeeCode}
        </div>
        <div className="text-gray-500">
          Company: {bonus.companyCode}
        </div>
      </div>

      {/* Financial Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">

        <div>
          <label className="block mb-1 text-gray-600">
            Monthly Basic
          </label>
          <input
            disabled
            value={bonus.basicSalary}
            className="w-full border rounded-md px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-600">
            Tenure (Years)
          </label>
          <input
            disabled
            value={bonus.tenureYears}
            className="w-full border rounded-md px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-600">
            Bonus Amount
          </label>
          <input
            type="number"
            value={bonusAmount}
            onChange={(e) => setBonusAmount(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-600">
            FCH Loan Deduction
          </label>
          <input
            type="number"
            disabled
            value={loan}
            onChange={(e) => setLoan(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div className="col-span-2">
          <label className="block mb-1 text-gray-600 font-medium">
            Net Bonus
          </label>
          <input
            disabled
            value={netAmount}
            className="w-full border rounded-md px-3 py-2 bg-gray-100 font-semibold text-green-600"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-3 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md bg-gray-200 text-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
        >
          Save Changes
        </button>
      </div>

    </div>
  )
}
