import RequestModal from "@/app/components/Modal";
import { useFetchWTax } from "@/app/hooks/useStatutory";
import EditWTax from "@/app/ModalContent/Statutory/EditWTax";
import { WTaxItem } from "@/app/types/statutoryType";
import { formatCurrency } from "@/app/utils/currencyConverter";
import { Pencil } from "lucide-react";
import { useState } from "react";







export default function WTaxPage(){
    const { data: wtax_data } = useFetchWTax();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTax, setselectedTax] = useState<WTaxItem | null>(null);

    if (!wtax_data) return null;

     const openModal = (row: WTaxItem) => {
        setselectedTax(row);
        setIsModalOpen(true);
        };
                            
    const closeModal = () => {
        setIsModalOpen(false);
    };

    return(
        <>
       <div className="space-y-4">
        <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
            <thead>
                <tr className="font-semibold bg-linear-to-r from-blue-950 to-blue-900 text-white">
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Start Range</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">End Range</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Annual Base Tax Bracket</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Rate Per Bracket</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Annual Base Tax Per Year</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody>
            {wtax_data.map((item, index) => (
                <tr key={index} className="border border-slate-300">
                    <td className="py-6 text-center">{formatCurrency(item.start_range)}</td>
                    <td className="py-6 text-center">{formatCurrency(item.end_range)}</td>
                    <td className="py-6 text-center">{formatCurrency(item.annual_base_tax_bracket)}</td>
                    <td className="py-6 text-center">{item.rate_per_bracket}</td>
                    <td className="py-6 text-center">{formatCurrency(item.annual_base_tax_per_year)}</td>
                    <td className="py-6 text-center"><button onClick={() => openModal(item)}
                     className="bg-blue-700 hover:bg-blue-500 text-white py-3 px-4 rounded"><Pencil/>
                     </button></td>
                </tr>
            ))}
            </tbody>
        </table>




            {isModalOpen && selectedTax &&(
                <RequestModal size="xl" title={`Edit WTax`} onClose={closeModal}>
                    <EditWTax data={selectedTax} onClose={closeModal}/>
                </RequestModal>
                )}
                                              
        </div>
        
    
        </>
    );

}