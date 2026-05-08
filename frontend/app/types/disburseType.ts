
export type EmployeeSetupItems = {
  empCode: string;
  Disbursing: boolean;
  WithAtm: boolean;
  Taxable: boolean;
}

export type UpdateEmployeeSetupPayload = {
  employees: EmployeeSetupItems[];
}

export type DisburseStatus = "AWAITING" | "APPROVED" | "REJECTED";

export type GetMainDisburseParams = {
  payrollPeriod?: string;
  status?: DisburseStatus;
  page?: number;
  limit?: number;
};

export type MainDisburseCount = {
  empDisburses: number;
};


export type MainDisburseItem = {
  mainDisburseID: number;
  typeDisburse: string;
  payrollCycle: string;
  payrollPeriod: string;
  createdAt: string;
  status: DisburseStatus;
  totalDisburse: string; 
  _count: MainDisburseCount;
};

export type GetMainDisburseResponse = {
  data: MainDisburseItem[];
  total: number;
  page: number;
  totalPages: number;
};

export type DisburseDetailsItem = {
  disburseID: number;
  empArchive: {
    id: number;
    disburse_amount: string | number;
    EmpCode: {
      EmpCode: string;
      BranchCode: {
        branchCode: string;
        Company: string | null;
      } | null;
      Firstname: string | null;
      Lastname: string | null;
      Position: string | null;
      Department: string | null;
    };
  };
};


export type PayrollCycle = "10-25-Cycle" | "15-30-Cycle";

export interface DisburseCompany {
  CompanyCode: number;
  CompanyName: string;
  isDisburse: boolean;
}

export interface GetDisburseCompaniesParams {
  cycle: PayrollCycle;
  isDisburse?: boolean;
}

export type CompanySetupItem = {
  CompanyCode: string;
  isDisburse: boolean;
};

export type UpdateCompanySetupPayload = {
  companies: CompanySetupItem[];
};