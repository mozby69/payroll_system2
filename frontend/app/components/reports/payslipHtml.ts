import { PaySlipTypes } from "@/app/types/preparePayroll";

export function payslipHtml(data: PaySlipTypes[]) {
  return data
    .map(
      (item) => `
      <div class="payslip">
        <div class="payslip-main">
            <div class="payslip-company">
                <p> EMB CAPITAL LENDING CORP.</p>
                <p>**PAYSLIP</p>
            </div>
            <div class="payslip-details">
                     <div class="payslip-details1">
                         <p>Employee Code: ${item.employeeCode}</p> 
                         <p>Name: ${item.name} </p> 
                    </div>
                     <div class="payslip-details2">
                         <p>Payroll Period: ${item.payrollPeriod ?? ""}</p> 
                         <p>To ${item.payrollPeriod ?? ""}</p> 
                    </div>
            </div>
             <div class="payslip-table">
                  <div style="grid-column: 1 / span 2;   border-inline: none;">Basic Pay: 10000</div>      
                  <div  style="grid-column: 3 / span 2;  border-right: none;">Overtime: 2323</div>      
                  <div  style="grid-column: 1 / span 4;  border: none;">
                    <div  style="display:flex;  justify-content: space-evenly; align-items: center;">
                            <div>
                                 (Less) Late: 0.00
                            </div>
                            <div>
                                 Absence: 0.00
                            </div>
                            <div>
                                 Gross Pay: 0.00
                            </div>
                     </div>  
                  </div>     
                   <div  style="grid-column: 1 / span 4; text-align:center;padding:5px; border-inline: none; border-bottom: none;letter-spacing: 2px; ">
                            DEDUCTIONS
                   </div> 
                   <div style="border-inline: none;"> 
                       SSS Cont: 131321
                   </div>
                    <div> 
                        W/Tax: 0000
                   </div>
                    <div style="border-inline: none;"> 
                       PAG-IBIG: 0000
                   </div>
                    <div style="border-right: none;"> 
                       AR/E:  0.00
                   </div>
                      <div style="border-inline: none;border-top: none;"> 
                       FCH Ln: 131321
                   </div>
                    <div style="border-top: none;"> 
                        Phl. Hlt: 0000
                   </div>
                    <div style="border-inline: none;border-top: none;"> 
                       P. Sal. Ln: 0000
                   </div>
                    <div style="border-top: none; border-right: none;"> 
                      OTHER LOANS
                   </div>
                      <div style="border: none;"> 
                            Salary: 0.00
                        </div>
                <div  style="grid-column: 2 / span 3; border: none;">
                    <div  style="display:flex; align-items: center; gap: 5rem;">
                          
                            <div>
                                 Calamity: 0.00
                            </div>
                            <div>
                                 Housing: 0.00
                            </div>
                     </div>  
                 </div>  
                 <div  style="grid-column: 1 / span 4; border-inline: none;border-bottom: none;">
                    <div  style="display:flex; justify-content: space-between; align-items: center;">
                            <div>
                                TOTAL DEDUCTIONS: 0.00
                            </div>
                            <div>
                                 NET PAYABLE: 0.00
                            </div>
                           
                     </div>  
                 </div>  
             </div>
             <div style="position: absolute; bottom: 42; left: 48; background-color: white; padding:2px;">
                SSS
             </div>
              <div style="position: absolute; bottom: 42; left: 168; background-color: white; padding:2px;">
                LOAN
             </div>
        </div>


        <div class="payslip-acknowledge">
               <div class="payslip-company">
                    <p> EMB CAPITAL LENDING CORP.</p>
                </div>
                <div class="flex">
                    <div class="flex" style="width: 30%;">
                     <div class="flex flex-col"  style="width: 100%;" >
                           <div class = "flex justify-between">
                                <p>Payroll Period</p>
                                <p>:</p>
                          </div>
                           <div class = "flex justify-between">
                                <p>Code</p>
                                <p>:</p>
                          </div>
                           <div class = "flex justify-between">
                                <p>Name</p>
                                <p>:</p>
                          </div>
                           <div class = "flex justify-between">
                                <p>NET PAY</p>
                                <p>:</p>
                          </div>
                    </div>
                    </div>
                      <div class="flex" style="width: 70%;">
                     <div class="flex flex-col"  style="width: 100%;" >
                           <div>
                                <p>01/01/2026</p>
                          </div>
                             <div>
                                <p>R0700</p>
                          </div>
                            <div>
                                <p>RAMOS, KIM JANREY</p>
                          </div>
                             <div>
                                <p>10000</p>
                          </div>
                    </div>
                    </div>
                </div>
        </div>
      </div>
      <hr style="border-top: 1px dotted black;" />


    `
    )
    .join("");
}
