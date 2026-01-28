import { PaySlipTypes } from "@/app/types/preparePayroll";
import { numberToPesoWords } from "@/app/utils/numberToWords";

export function payslipHtml(data: PaySlipTypes[]) {
  return data
    .map(
      (item) => `
      <div class="payslip">
            <div class="payslip-main">
                <div class="payslip-company">
                    <p> EMB CAPITAL LENDING CORP.</p>
                    <p>**PAYSLIP**</p>
                </div>
                <div class="payslip-details">
                        <div class="payslip-details1">
                            <p>Employee Code: ${item.employeeCode}</p> 
                            <p>Name: ${item.name} </p> 
                        </div>
                        <div class="payslip-details2">
                            <p>Payroll Period: ${item.payrollPeriod ?? ""}</p> 
                            <p>To  ${item.payrollPeriod ?? ""}</p> 
                        </div>
                </div>
                <div class="payslip-table">
                    <div style="grid-column: 1 / span 2;   border-inline: none;">Basic Pay : 10000</div>      
                    <div  style="grid-column: 3 / span 2;  border-right: none;">Overtime : 2323</div>      
                    <div  style="grid-column: 1 / span 3;  border: none;">
                            <div  style="display:flex;  justify-content: space-evenly; align-items: center;">
                                    <div>
                                        (Less) Late : 0.00
                                    </div>
                                     <div>
                                        Undertime : 0.00
                                    </div>
                                    <div>
                                        Absence : 0.00
                                    </div>
                            </div>  
                    </div>     
                      <div style="border-block: none; border-right: none;">
                                    Gross Pay : 150000.00
                            </div>
                    <div  style="grid-column: 1 / span 4; text-align:center; border-inline: none; border-bottom: none;letter-spacing: 2px; ">
                                DEDUCTIONS
                    </div> 
                    <div class="flex justify-between" style="border-inline: none;"> 
                        <div>  SSS Cont : </div>
                        <div>  131321 </div>
                    </div>
                     <div class="flex justify-between" > 
                        <div>  W/Tax : </div>
                        <div>  131321 </div>
                    </div>
                     <div class="flex justify-between" style="border-inline: none;"> 
                        <div>   PAG-IBIG : </div>
                        <div>  131321 </div>
                    </div>
                      <div class="flex justify-between" style="border-right: none;"> 
                        <div>    AR/E: </div>
                        <div>  131321 </div>
                    </div>
                    <div class="flex justify-between" style="border-inline: none;border-top: none;"> 
                        <div>    FCH Ln: </div>
                        <div>  131321 </div>
                    </div>
                     <div class="flex justify-between" style="border-top: none;"> 
                        <div>    Phl. Hlt : </div>
                        <div>  131321 </div>
                    </div>
                      <div class="flex justify-between" style="border-inline: none;border-top: none;"> 
                        <div>     P. Sal. Ln : </div>
                        <div>  131321 </div>
                    </div>
                    <div style="border-top: none; border-right: none; text-align: center"> 
                        OTHER LOANS
                    </div>
                    <div class="flex justify-between" style="border: none;"> 
                        <div>     Salary : </div>
                        <div>  131321 </div>
                    </div>
                    
                            <div class="flex justify-between"" style="border: none;"> 
                                <div>     Calamity : </div>
                                <div>  131321 </div>
                            </div>
                            <div class="flex justify-between"" style="border: none;"> 
                                <div>      Housing : </div>
                                <div>  131321 </div>
                            </div>
                    
                    <div  style="grid-column: 1 / span 4; border-inline: none;border-bottom: none;">
                        <div  style="display:flex; align-items: center; gap:8rem;">
                                <div class="flex justify-between" style="width: 50%" > 
                                    <div>      TOTAL DEDUCTIONS : </div>
                                    <div>  131321 </div>
                                </div>
                              <div class="flex justify-between" style="width: 50%" > 
                                <div>      NET PAYABLE : </div>
                                <div>  131321 </div>
                            </div>
                        </div>  
                    </div>  
                </div>
                <div style="position: absolute; bottom: 48; left: 52; background-color: white; padding-inline:2px;">
                    SSS
                </div>
                <div style="position: absolute; bottom: 48; left: 172; background-color: white; padding-inline:2px;">
                    LOAN
                </div>
            </div>

            <div class="payslip-acknowledge">
                    <div class="flex flex-col">
                         <div class="payslip-company" style="margin-bottom: 2px;">
                            <p> EMB CAPITAL LENDING CORP.</p>
                        </div>
                        <div class="flex">
                            <div class="flex" style="width: 45%; ">
                            <div class="flex flex-col p-0"  style="width: 100%;" >
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
                                <div class="flex p-0" style="width: 55%;">
                                    <div class="flex flex-col"  style="width: 100%;" >
                                    <div>
                                            <p >01/01/2026</p>
                                    </div>
                                        <div>
                                            <p >R0700</p>
                                    </div>
                                        <div>
                                            <p >RAMOS, KIM JANREY</p>
                                    </div>
                                    <div>
                                            <p >10000</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="p-0"> 
                        
                            <p >  Received the amount of:</p>
                        </div>
                        <div style="text-align: center; border-bottom: 1px dotted black;"> 
                            <p>${numberToPesoWords(9178.0) } </p>
                        </div>
                        <div> 
                            <p style="line-height: 1.6;">I acknowledge receipt of the amount stated in full payment of my salary  9178.00</p>
                            
                        </div>
                       
                    </div>
                     <div class="flex justify-between" style="gap: 1rem;">  
                            <div 
                                style="border-top: 1px solid black; 
                                       width: 50%;padding-bottom: .6rem; 
                                       display: flex;    
                                        justify-content: center;
                                        text-align: center;"> 
                                Signature
                            </div>
                              <div 
                                style="border-top: 1px solid black; 
                                       width: 50%;padding-bottom: .6rem; 
                                       display: flex;    
                                        justify-content: center;
                                        text-align: center;"> 
                                Date
                            </div>
                     </div>
            </div>
      </div>
      <hr style="border-top: 1px dotted black; padding: 0px; margin: 3px;" />


    `
    )
    .join("");
}
