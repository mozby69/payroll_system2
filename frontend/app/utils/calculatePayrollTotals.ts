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
  
 export function calculatePayrollTotals(
  employees: any[]
): PayrollTotals {
  const toCents = (value: unknown): number => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  };

  const totals = employees.reduce(
    (acc, e) => {
      acc.halfBasic += toCents(e.halfBasic);
      acc.overtime += toCents(e.overtime);

      // Combine Late + Undertime
      acc.late +=
        toCents(e.late) +
        toCents(e.undertime);

      acc.absences += toCents(e.absences);
      acc.total += toCents(e.total);

      acc.pagibig += toCents(e.pagIbigEmployeer);
      acc.sss += toCents(e.sssEmployeer);
      acc.philhealth += toCents(e.philhealthEmployeer);

      return acc;
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
    }
  );

  const grandTotal =
    totals.total +
    totals.pagibig +
    totals.sss +
    totals.philhealth;

  return {
    halfBasic: totals.halfBasic / 100,
    overtime: totals.overtime / 100,
    late: totals.late / 100,
    absences: totals.absences / 100,
    total: totals.total / 100,
    pagibig: totals.pagibig / 100,
    sss: totals.sss / 100,
    philhealth: totals.philhealth / 100,
    grandTotal: grandTotal / 100,
  };
}