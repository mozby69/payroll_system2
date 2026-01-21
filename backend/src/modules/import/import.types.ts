export type BranchDTO = {
    BranchCode: string;
    Company: string;
    Location: string;
    Employees: string;
    company__CompanyCode: string | null;
  };
  

  export type EmployeeDTO = {
    EmpCode: string;
    Firstname: string;
    Middlename: string;
    BranchCode__BranchCode: string | null;
    Lastname:string;
    DateofBirth:string;
    EmployementDate:string;
    EmploymentStatus:string;
    EmployeeStatus:string;
  };

  export type CompanyDTO = {
    CompanyCode: string;
    CompanyCycle:string;
    CompanyName:string;
  }

  export type EmployeeDetailsDTO = {
    EmpCode__EmpCode: string;
  
    EmpTin: string | null;
    EmpSSSNo: string | null;
    EmpPhilhlthNo: string | null;
    EmpPagibigNo: string | null;
  
    EmpCode__familybgrnd__empchildren__EmpChildrenName: string | null;
    EmpCode__familybgrnd__empchildren__EmpChildrenBirthday: string | null;
    EmpCode__familybgrnd__empchildren__EmpChildrenBplace: string | null;
  };
  


export type DjangoExportResponse = {
    branches: BranchDTO[];
    employees: EmployeeDTO[];
    employees_details: EmployeeDetailsDTO[];
    company_details:CompanyDTO[];
  };