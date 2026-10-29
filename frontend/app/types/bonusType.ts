import { CompanyDetailsType } from "./generalTypes"

export type BonusType =
  | "QUARTERLY"
  | "MIDYEAR"
  | "ANNUAL"
  | "SPECIAL"

export type BonusRuleInfo = {
    code: string
    name: string
    bonusType: BonusType
    minTenureMonths: number
  }

  export type EmployeeInfo = {
    Firstname: string
    Middlename: string | null
    Lastname: string
    EmployementDate: string // ISO string from backend
    EmploymentStatus: string
    employeepayroll: EmployeePayroll
  }

  export type EmployeePayroll = {
      basic_salary: string;
  }


  export type EmployeeBonus = {
    employeeCode: string
    amount: string 
    bonusRuleId: number
    bonusRule: BonusRuleInfo
    employee: EmployeeInfo
    tenureMonths: number

  }

export type InvalidEmployees = {
  empCode: string
  name: string
  basicSalary: number
  amount: number
}

 export type BonusErrorResponse = {
    code: string
    invalidEmployees: InvalidEmployees[]
    message: string
    error: {
      code: string
      message: string
      invalidEmployees?: InvalidEmployees[]
    }
  }

  export type BonusCompanyRule = {
    id: number
    bonusRuleId: number
    companyCode: string
    companyDetails: CompanyDetailsType
  }

  export type BonusSummaryType = {
      id: number
      bonusRuleId: number
      batchId?: string | null;
      releasePeriod: string
      asOfDate: string
      generateDate: string
      totalEmployees: number
      totalAmount: number
      status: string
      releaseDate: string
      resetAt: string
      createdAt: string
      companyCode: string
      bonusRule: {
        code: string
        name: string
        companyRule: {
          companyCode: string
        }[]
      }
  }

  export type EmployeBonusType = {
    employeeCode: string
    companyCode: string
    branchCode: string
    fullName: string
    employementDate: string | null
    tenureYears: number
    basicSalary: number
    bonusAmount: number
    bonusStatus: string
    bonusId?: number | null
    fchLoan: number
    netAmount: number
    hasLeave?: boolean
    remarks?: string | null
    notes?: string | null

  }

  export type BonusRuleType = {
  code: string;
  name: string;
  bonusType: string;
  eligibleMonth?: number | null;
};



export type EmployeeGenerateBonusResponse = {
  success: boolean;
  data: {
    summary: BonusSummaryType | null;
    summaries: BonusSummaryType[];
    batchId?: string | null;
    employees: EmployeeWithBonuses[];
    companies: {
      companyCode: string;
    }[];
    variance: {
      prevPayroll: number;
      prevPayrollDate: string;
      totalArchive: number;
      totalEmployees: number;
      totalVarianceBasicSalary: number;
      varianceCount: number;
      varianceEmployees: {
        EmpCode: string;
        basic_salary: number;
        name: string;
        type: string;
        remarks: string;
        date: string;
      }[];
    }[];
  };
};


  export type BonusRuleCompanyModalProps = {
    initialData?: { id?: number; name?: string }
  }


  export type CompanyBonusRule = {
    id: number
    code: string
    name: string
    bonusType: string 
    eligibleMonth: number
    formulaType: string 
    minTenureYear: number
    isUsed: boolean
  }

  export type CompanyBonusRuleResponse = {
    message: string
    data: CompanyBonusRule[]
  }
  

export type EmployeeBonusDetailType = {
  bonusId: number;
  bonusSummaryId: number;
  bonusRule: BonusRuleType;
  bonusAmount: number;
  loanDeduction: number;
  netAmount: number;
  status: string;
  remarks: string | null;
  notes: string | null;
};


export type EmployeeWithBonuses =
  EmployeBonusType & {
    bonuses?: EmployeeBonusDetailType[];
  };



export type SignatoryPerson = {
  name: string;
  position: string;
};

export type BonusSignatories = {
  preparedBy: SignatoryPerson;
  checkedBy: SignatoryPerson[];
  approvedBy: SignatoryPerson;
};
  
  