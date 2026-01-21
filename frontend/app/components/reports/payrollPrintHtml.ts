// app/components/reports/payrollPrintHtml.ts

export interface PayrollRow {
    employee: string;
    basicPay: number;
    overtime: number;
    late: number;
    absence: number;
    total: number;
    wTax: number;
    sss: number;
    philHealth: number;
    pagIbig: number;
    arE: number;
    fch: number;
    salary: number;
    calamity: number;
    pagSalaryLoan: number;
    netPayable: number;
    sssEmpShare: number;
    philEmpShare: number;
    pagEmpShare: number;
  }
  
  export function payrollPrintHtml(data: PayrollRow[]) {
    return `
  <table class="payroll-table">
  
    <!-- COLUMN WIDTH CONTROL -->
    <colgroup>
      <col style="width:40px">
      <col style="width:160px">
      <col span="18" style="width:auto">
    </colgroup>
  
    <thead>
      <!-- GROUP HEADERS -->
      <tr class="group-header">
        <th colspan="13"></th>
        <th colspan="3">SSS LOANS</th>
        <th colspan="1"></th>
        <th colspan="3">EMPLOYEE SHARE</th>
      </tr>
  
      <!-- COLUMN HEADERS -->
      <tr>
        <th>No.</th>
        <th>Employee Name</th>
        <th>Basic Pay</th>
        <th>Overtime</th>
        <th>Late</th>
        <th>Absence</th>
        <th>Total</th>
        <th>W/Tax</th>
        <th>SSS</th>
        <th>PhillHealth</th>
        <th>Pag-ibig</th>
        <th>AR/E</th>
        <th>FCH</th>
        <th>Salary</th>
        <th>Calamity</th>
        <th>Pag. Sal. Ln</th>
        <th>Net Payable</th>
        <th>SSS</th>
        <th>Philhealth</th>
        <th>Pag-ibig</th>
      </tr>
    </thead>
  
    <tbody>
      ${data
        .map(
          (row, i) => `
        <tr>
          <td class="center">${i + 1}</td>
          <td class="truncate" title="${row.employee}">
            ${row.employee}
          </td>
          <td class="right">${row.basicPay}</td>
          <td class="right">${row.overtime}</td>
          <td class="right">${row.late}</td>
          <td class="right">${row.absence}</td>
          <td class="right">${row.total}</td>
          <td class="right">${row.wTax}</td>
          <td class="right">${row.sss}</td>
          <td class="right">${row.philHealth}</td>
          <td class="right">${row.pagIbig}</td>
          <td class="right">${row.arE}</td>
          <td class="right">${row.fch}</td>
          <td class="right">${row.salary}</td>
          <td class="right">${row.calamity}</td>
          <td class="right">${row.pagSalaryLoan}</td>
          <td class="right bold">${row.netPayable}</td>
          <td class="right">${row.sssEmpShare}</td>
          <td class="right">${row.philEmpShare}</td>
          <td class="right">${row.pagEmpShare}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  `;
  }
  