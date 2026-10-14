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
    Position: string;
    Department: string;
    SecondaryBranch:string;
    isAlien:boolean;
    EndDate:string;
    CivilStatus:string;
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
  


  export type SpecialleavesDTO = {
    id:number;
    EmpCode__EmpCode: string;
    leaveName: string | null;
    start: string | null;
    end: string | null;
    expectedStart:string | null;
    expectedEnd:string | null;
    status:string | null;

  };


export type DjangoExportResponse = {
    branches: BranchDTO[];
    employees: EmployeeDTO[];
    employees_details: EmployeeDetailsDTO[];
    company_details:CompanyDTO[];
    special_leaves:SpecialleavesDTO[];
  };




export type attendance_countDTO = {
  ID:number;
  EmpCode__EmpCode: string;
  Vacation: string;
  Sick:string;
}

  export type DjangoExportResponse2 = {
    attendance_count: attendance_countDTO[];
  };



