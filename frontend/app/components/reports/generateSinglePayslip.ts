import { EmployeeArchivedType } from "@/app/types/totalPayroll"
import { numberToPesoWords } from "@/app/utils/numberToWords"

export function generateSinglePayslip(item: EmployeeArchivedType) {

    const gross = Number(item.Grosspay || 0)
    const net = Number(item.Netpay || 0)
  
    const totalDeductions =
      Number(item.w_tax || 0) +
      Number(item.sss_loan || 0) +
      Number(item.pagibig_loan || 0) +
      Number(item.sss_calamity_loan || 0)
  
    return `
      <div class="payslip">
            <div class="payslip-main">
                <div class="payslip-company">
                    <p> EMB CAPITAL LENDING CORP.</p>
                    <p>**PAYSLIP**</p>
                </div>
                <div class="payslip-details">
                        <div class="payslip-details1">
                            <p>Employee Code: ${item.EmpCodeId}</p> 
                            <p>Name: ${item.EmpCode.Lastname ?? ""} ,  ${item.EmpCode.Firstname ?? ""} </p> 
                        </div>
                        <div class="payslip-details2">
                            <p>Payroll Period: ${item.PayCode ?? ""}</p> 
                            <p>To  ${item.PayCode ?? ""}</p> 
                        </div>
                </div>
                <div class="payslip-table">
                    <div style="grid-column: 1 / span 2;   border-inline: none;">Basic Pay : ${item.Basic_salary ?? "0.00"}</div>      
                    <div  style="grid-column: 3 / span 2;  border-right: none;">Overtime : 
                     ${
                        Number(item.Overtime) === 0
                        ? "0.00"
                        : Number(item.Overtime).toFixed(2)
                    }
                    </div>      
                    <div  style="grid-column: 1 / span 3;  border: none;">
                            <div  style="display:flex;  justify-content: space-evenly; align-items: center;">
                                    <div>
                                        (Less) Late :
                                         ${
                                            Number(item.Late) === 0
                                            ? "0.00"
                                            : Number(item.Late).toFixed(2)
                                        }
                                    </div>
                                     <div>
                                        Undertime : ${item.undertime ?? "0.00"}
                                    </div>
                                    <div>
                                        Absence : 
                                           ${
                                            Number(item.Absent) === 0
                                            ? "0.00"
                                            : Number(item.Absent).toFixed(2)
                                        }
                                    </div>
                            </div>  
                    </div>     
                      <div style="border-block: none; border-right: none;">
                                    Gross Pay : ${item.Grosspay ?? "0.00"}
                            </div>
                    <div  style="grid-column: 1 / span 4; text-align:center; border-inline: none; border-bottom: none;letter-spacing: 2px; ">
                                DEDUCTIONS
                    </div> 
                    <div class="flex justify-between" style="border-inline: none;"> 
                        <div>  SSS Cont : </div>
                        <div>  ${item.SSS_employee_share ?? "0.00"} </div>
                    </div>
                     <div class="flex justify-between" > 
                        <div>  W/Tax : </div>
                        <div>    
                            ${
                                Number(item.w_tax) === 0
                                ? "0.00"
                                : Number(item.w_tax).toFixed(2)
                            }
                        </div>
                    </div>
                     <div class="flex justify-between" style="border-inline: none;"> 
                        <div>   PAG-IBIG : </div>
                        <div>  
                            ${
                                Number(item.Pagibig_employee_share) === 0
                                ? "0.00"
                                : Number(item.Pagibig_employee_share).toFixed(2)
                            }
                        </div>
                    </div>
                      <div class="flex justify-between" style="border-right: none;"> 
                        <div>    AR/E: </div>
                        <div>  ${item.ar_e ?? "0.00"}</div>
                    </div>
                    <div class="flex justify-between" style="border-inline: none;border-top: none;"> 
                        <div>    FCH Ln: </div>
                        <div>  ${item.fch_loan ?? "0.00"} </div>
                    </div>
                     <div class="flex justify-between" style="border-top: none;"> 
                        <div>    Phl. Hlt : </div>
                        <div>  ${item.philhealth_employee_share ?? "0.00"} </div>
                    </div>
                      <div class="flex justify-between" style="border-inline: none;border-top: none;"> 
                        <div>     P. Sal. Ln : </div>
                        <div>  ${item.pagibig_loan ?? "0.00"} </div>
                    </div>
                    <div style="border-top: none; border-right: none; text-align: center"> 
                        OTHER LOANS
                    </div>
                    <div class="flex justify-between" style="border: none;"> 
                        <div>     Salary : </div>
                        <div>  ${item.sss_loan ?? "0.00"} </div>
                    </div>
                    
                            <div class="flex justify-between"" style="border: none;"> 
                                <div>     Calamity : </div>
                                <div>  ${item.sss_calamity_loan ?? "0.00"} </div>
                            </div>
                            <div class="flex justify-between"" style="border: none;"> 
                                <div>      Housing : </div>
                                <div>  ${item.sss_calamity_loan ?? "0.00"} </div>
                            </div>
                    
                    <div  style="grid-column: 1 / span 4; border-inline: none;border-bottom: none;">
                        <div  style="display:flex; align-items: center; gap:8rem;">
                                <div class="flex justify-between" style="width: 50%" > 
                                    <div>      TOTAL DEDUCTIONS : </div>
                                    <div>  ${item.sss_calamity_loan ?? "0.00"} </div>
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
                                            <p >
                                                 ${item.PayCode}
                                            </p>
                                    </div>
                                    <div>
                                            <p>
                                             ${item.EmpCodeId}
                                            </p>
                                    </div>
                                        <div>  
                                         <p>
                                              ${item.EmpCode.Lastname} ,   ${item.EmpCode.Firstname}
                                        </p>
                                       </div>
                                    <div>
                                            <p >
                                                  ${item.Netpay}
                                            </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="p-0"> 
                        
                            <p >  Received the amount of:</p>
                        </div>
                        <div style="text-align: center; border-bottom: 1px dotted black;"> 
                            <p>${numberToPesoWords(Number(item.Netpay)) } </p>
                        </div>
                        <div> 
                            <p style="line-height: 1.6;">I acknowledge receipt of the amount stated in full payment of my salary ${item.Netpay}</p>
                            
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
  }
  