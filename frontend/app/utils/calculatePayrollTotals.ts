export type PayrollTotals = {
    halfBasic: number
    overtime: number
    late: number
    absences: number
    total: number
    pagibig: number
    sss: number
    philhealth: number
    grandTotal: number
  }
  
  export function calculatePayrollTotals(employees: any[]): PayrollTotals {
    const safe = (v: unknown) => Number(v) || 0
  
    const totals = employees.reduce(
      (acc, e) => {
        acc.halfBasic += safe(e.halfBasic)
        acc.overtime += safe(e.overtime)
        acc.late += safe(e.late)
        acc.absences += safe(e.absences)
        acc.total += safe(e.total)
        acc.pagibig += safe(e.pagIbigEmployeer)
        acc.sss += safe(e.sssEmployeer)
        acc.philhealth += safe(e.philhealthEmployeer)
        return acc
      },
      {
        halfBasic: 0,
        overtime: 0,
        late: 0,
        absences: 0,
        total: 0,
        pagibig: 0,
        sss: 0,
        philhealth: 0,
        grandTotal: 0,
      }
    )
  
    totals.grandTotal =
      totals.total +
      totals.pagibig +
      totals.sss +
      totals.philhealth
  
    return totals
  }