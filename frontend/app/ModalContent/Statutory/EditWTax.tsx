import { useUpdateWtax } from "@/app/hooks/useStatutory";
import { WTaxItem } from "@/app/types/statutoryType";
import { useState } from "react";


type EditWTaxProps = {
    data: WTaxItem;
    onClose: () => void;
  };




export default function EditWTax({data,onClose}:EditWTaxProps){


      const [form, setForm] = useState({
            start_range: data.start_range.toString(),
            end_range: data.end_range.toString(),
            annual_base_tax_bracket:data.annual_base_tax_bracket.toString(),
            rate_per_bracket:data.rate_per_bracket.toString(),
            annual_base_tax_per_year:data.annual_base_tax_per_year.toString(),
        });

        const updateMutation = useUpdateWtax();

        const handleChange = (
            e: React.ChangeEvent<HTMLInputElement>
          ) => {
            const { name, value } = e.target;
          
            setForm((prev) => ({
              ...prev,
              [name]: value,
            }));
          };

          const handleSubmit = async () => {
            await updateMutation.mutateAsync({
              id: data.id,
              start_range: Number(form.start_range),
              end_range: Number(form.end_range),
              annual_base_tax_bracket: Number(form.annual_base_tax_bracket),
              rate_per_bracket: Number(form.rate_per_bracket),
              annual_base_tax_per_year: Number(form.annual_base_tax_per_year),
            });
          
            onClose();
          };

    return(
        <>
        <div className="grid grid-cols-2 gap-y-4 gap-x-4 pb-4">

            <div className="grid gap-y-2">
            <label htmlFor="" className="font-semibold">Start Range</label>
            <input
                type="text"
                name="start_range"
                value={form.start_range}
                onChange={handleChange}
                className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            
            <div className="grid gap-y-2">
            <label htmlFor="" className="font-semibold">End Range</label>
            <input
                type="text"
                name="end_range"
                value={form.end_range}
                onChange={handleChange}
                className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

              
            <div className="grid gap-y-2">
            <label htmlFor="" className="font-semibold">Annual Base Tax Bracket</label>
            <input
                type="text"
                name="annual_base_tax_bracket"
                value={form.annual_base_tax_bracket}
                onChange={handleChange}
                className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid gap-y-2">
            <label htmlFor="" className="font-semibold">Rate Per Bracket</label>
            <input
                type="text"
                name="rate_per_bracket"
                value={form.rate_per_bracket}
                onChange={handleChange}
                className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid gap-y-2">
            <label htmlFor="" className="font-semibold">Annual Base Tax Per Year</label>
            <input
                type="text"
                name="annual_base_tax_per_year"
                value={form.annual_base_tax_per_year}
                onChange={handleChange}
                className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

        </div>


        <div className="flex justify-end border-t border-slate-300 gap-x-2">
            <button 
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded mt-4 cursor-pointer">
                close
            </button>
            <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded mt-4 cursor-pointer">
                Update
            </button>
        </div>

        </>
    );
}