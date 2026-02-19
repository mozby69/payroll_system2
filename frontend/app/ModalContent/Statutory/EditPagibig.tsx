import { useUpdatePagibigContribution, useUpdateSSSContribution } from "@/app/hooks/useStatutory";
import { PagibigProps, SSSProps } from "@/app/types/statutoryType";
import { useState } from "react";





type EditPagibigProps = {
    data: PagibigProps;
    onClose: () => void;
  };
  
  export default function EditPagibigData({ data, onClose }: EditPagibigProps) {
    const [form, setForm] = useState({
      name: data.Name,
      pagibig_employee_share: data.pagibig_employee_share.toString(),
      pagibig_employer_share: data.pagibig_employer_share.toString(),
    });
  
    const updateMutation = useUpdatePagibigContribution();
  
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
          id: data.pagibig_id,
          pagibig_employee_share: Number(form.pagibig_employee_share),
          pagibig_employer_share: Number(form.pagibig_employer_share),
        });
      
        onClose();
      };
      
  
    return (
        <>
     


      <div className="grid grid-cols-2 gap-4 pb-4">

      <div className="grid col-span-2 gap-y-2">
            <label htmlFor="" className="font-semibold">Employee Name</label>
            <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
        </div>

       
        <div className="grid grid-rows gap-y-2">
            <label htmlFor="" className="font-semibold">Employee Share</label>
            <input
                type="number"
                name="pagibig_employee_share"
                value={form.pagibig_employee_share}
                onChange={handleChange}
                className="input border border-slate-300 px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
        </div>
     
        <div className="grid grid-rows gap-y-2"> 
            <label htmlFor=""className="font-semibold">Employer Share</label>
            <input
                type="number"
                name="pagibig_employer_share"
                value={form.pagibig_employer_share}
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
  