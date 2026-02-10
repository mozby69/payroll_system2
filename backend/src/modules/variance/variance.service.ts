import { displayCompletePayroll } from "../payroll_archive/payroll_archive.service";






export async function fetchVariance() {

    try{
        const computed = await displayCompletePayroll(['FOR_APPROVAL']);
        if (!computed || computed.length === 0) return 0;
  
        const payload = computed.map((emp) => ({
            PayCode: emp.PayCode,

        }));

        return payload;
    }
     catch(error){
        console.error("error occured",error);
        
     }

}