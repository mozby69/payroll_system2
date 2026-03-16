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
  };

    export type PayrollArchiveReport = {
        boardEmployees: PayrollArchiveEmployee[];
        mancomEmployees: PayrollArchiveEmployee[];
        holdingEmployees: PayrollArchiveEmployee[];
        branchGroups: Record<string, PayrollArchiveEmployee[]>;
      };