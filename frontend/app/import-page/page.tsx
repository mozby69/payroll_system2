"use client";

import "flatpickr/dist/flatpickr.min.css";
import { useState,useRef } from "react";
import { useImportSQL } from '@/app/hooks/useImport';
import SweetAlert from '@/app/components/Swal';
import dynamic from "next/dynamic";


function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importMutation = useImportSQL();
    const [range, setRange] = useState<Date[]>([]);

  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        setFile(e.target.files[0]);
      }
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
  
      if (file) {
        importMutation.mutate(file, {
          onSuccess: () => {
            SweetAlert.successAlert("Success", "Import data successfully!");
  
            setFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = ""; 
            }
          },
          onError: () => {
            SweetAlert.errorAlert("Error", "Error occurred");
          },
        });
      }
    };
  

    const Flatpickr = dynamic(() => import("react-flatpickr"), {
      ssr: false,
    });
    
    
    return (

<div>
<Flatpickr
      value={range}
      onChange={(dates) => setRange(dates)}
      options={{
        mode: "range",
        dateFormat: "Y-m-d",
      }}
      className="border px-2 py-1 rounded w-full"
      placeholder="Select date range"
    />

  <button className="p-2 bg-red-400">Click Test</button>

<form onSubmit={handleSubmit} className="bg-white h-screen text-black">

<div>


  
  <div>
    <input ref={fileInputRef} type="file" accept=".sql" onChange={handleFileChange} className="bg-green-200"/>
    <button type="submit" disabled={importMutation.isPending}>
      {importMutation.isPending ? "Importing..." : "Import"}
    </button>
  </div>
</div>

</form>

</div>




    );
  }
  

  export default ImportPage;