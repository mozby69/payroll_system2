
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
    Netpay: string | number;
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