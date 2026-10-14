export type PayrollArchiveEmployee = {
    empCode: string;
    name: string;
    board: string | null;
    branch: string | null;
    department: string | null;
    basic: number;
    halfBasic: number;
    overtime: number;
    late: number;
    undertime: number;
    absences: number;
    total: number;
    pagIbigEmployeer: number;
    sssEmployeer: number;
    philhealthEmployeer: number;
    reason: string
    leaveInfo: {
      start: string
      end: string
      status: string
      type: string
    }

  };

  export type PayrollArchiveSummaries = {
    company: string;
    PayCycle: string;
  }

    export type PayrollArchiveReport = {
        summaries: PayrollArchiveSummaries;
        boardEmployees: PayrollArchiveEmployee[];
        mancomEmployees: PayrollArchiveEmployee[];
        holdingEmployees: PayrollArchiveEmployee[];
        branchGroups: Record<string, PayrollArchiveEmployee[]>;
      };


export type PayrollArchiveGrandTotal = {
  absences: number;
  halfBasic: number;
  late: number;
  overtime: number;
  pagibig: number;
  philhealth: number;
  sss: number;
  total: number;
}