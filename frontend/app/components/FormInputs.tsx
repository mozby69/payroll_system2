import { InputHTMLAttributes, SelectHTMLAttributes } from "react"

type InputFieldProps = {
    label: string
    error?: string
  } & InputHTMLAttributes<HTMLInputElement>

export function InputField({ label, error, ...props }: InputFieldProps) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          {...props}
          className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    )
  }
  

  
type SelectFieldProps = {
    label: string
    options: readonly string[]
    error?: string
  } & SelectHTMLAttributes<HTMLSelectElement>
  
  export function SelectField({ label, options, error, ...props }: SelectFieldProps) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <select
          {...props}
          className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select</option>
          {options.map((o: string) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    )
  }
  