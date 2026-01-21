import { dummySummary } from "@/app/types/dummyData";

  
 
  
                 export default function SpreadSheet() {
                  return (
                    <div className="print-area w-full">
                      <table className="w-full border-collapse text-[9pt] ">
                        <thead>
                          <tr>
                            <th colSpan={13}></th>
                            <th colSpan={2} className="th text-center">SSS LOANS</th>
                            <th colSpan={2}></th>
                            <th colSpan={3} className="th text-center">EMPLOYEE SHARE</th>
                          </tr>
                
                          <tr>
                            <th className="th w-10">No.</th>
                            <th className="th w-40">Employee Name</th>
                            <th className="th">Basic Pay</th>
                            <th className="th">Overtime</th>
                            <th className="th">Late</th>
                            <th className="th">Absence</th>
                            <th className="th">Total</th>
                            <th className="th">W/Tax</th>
                            <th className="th">SSS</th>
                            <th className="th">PhilHealth</th>
                            <th className="th">Pag-ibig</th>
                            <th className="th">AR/E</th>
                            <th className="th">FCH</th>
                            <th className="th">Salary</th>
                            <th className="th">Calamity</th>
                            <th className="th">Pag. Sal. Ln</th>
                            <th className="th">Net Payable</th>
                            <th className="th">SSS</th>
                            <th className="th">PhilHealth</th>
                            <th className="th">Pag-ibig</th>
                          </tr>
                        </thead>
                
                        <tbody>
                          {dummySummary.map((row, idx) => (
                            <tr key={idx}>
                              <td className="td text-center">{idx + 1}</td>
                              <td className="td truncate" title={row.employee}>
                                {row.employee}
                              </td>
                              <td className="td text-right">{row.basicPay}</td>
                              <td className="td text-right">{row.overtime}</td>
                              <td className="td text-right">{row.late}</td>
                              <td className="td text-right">{row.absence}</td>
                              <td className="td text-right">{row.total}</td>
                              <td className="td text-right">{row.wTax}</td>
                              <td className="td text-right">{row.sss}</td>
                              <td className="td text-right">{row.philHealth}</td>
                              <td className="td text-right">{row.pagIbig}</td>
                              <td className="td text-right">{row.arE}</td>
                              <td className="td text-right">{row.fch}</td>
                              <td className="td text-right">{row.salary}</td>
                              <td className="td text-right">{row.calamity}</td>
                              <td className="td text-right">{row.pagSalaryLoan}</td>
                              <td className="td text-right font-semibold">{row.netPayable}</td>
                              <td className="td text-right">{row.sssEmpShare}</td>
                              <td className="td text-right">{row.philEmpShare}</td>
                              <td className="td text-right">{row.pagEmpShare}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                
                
  