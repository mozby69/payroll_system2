export type VarianceEmployee = {
    EmpCode: string
    name: string
    type: "BONUS_NO_ARCHIVE" | "ARCHIVE_NO_BONUS" | "SALARY_CHANGED"
    basic_salary?: number
    remarks?: string
    date?: string
  }