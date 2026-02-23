import { useUpdateSSSContribution } from "@/app/hooks/useStatutory";
import { SSSProps } from "@/app/types/statutoryType";
import { useState } from "react";





type EditSSSProps = {
    data: SSSProps;
    onClose: () => void;
  };
  
  export default function EditSSSData({ data, onClose }: EditSSSProps) {
    const [form, setForm] = useState({
      start_range: data.start_range,
      end_range: data.end_range,
      employee_share: data.employee_share,
      employer_share: data.employer_share,
    });
  
    const updateMutation = useUpdateSSSContribution();
  
    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    };
  
    const handleSubmit = async () => {
      await updateMutation.mutateAsync({
        id: data.sss_contrib_id,
        ...form,
      });
  
      onClose();
    };
  
    return (
        <>
      <div className="grid grid-cols-2 gap-4 pb-4">

        <div className="grid grid-rows gap-y-2">
            <label htmlFor="" className="font-semibold">Start Range</label>
            <input
                name="start_range"
                value={form.start_range}
                onChange={handleChange}
                className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
        </div>
     
        <div className="grid grid-rows gap-y-2"> 
            <label htmlFor=""className="font-semibold">End Range</label>
            <input
            name="end_range"
            value={form.end_range}
            onChange={handleChange}
            className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div className="grid grid-rows gap-y-2"> 
            <label htmlFor="" className="font-semibold">Employee Share</label>
            <input
            name="employee_share"
            value={form.employee_share}
            onChange={handleChange}
            className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div className="grid grid-rows gap-y-2"> 
            <label htmlFor=""className="font-semibold">Employer Share</label>
            <input
            name="employer_share"
            value={form.employer_share}
            onChange={handleChange}
            className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        
       
       
      

      </div>

        <div className="flex justify-end border-t border-slate-300 gap-x-2">
            <button 
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded mt-4 cursor-pointer">
                close</button>
            <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded mt-4 cursor-pointer">
                Update
            </button>
        </div>
   
      </>
    );
  }
  