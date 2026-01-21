export interface EmployeeList{
    EmpCode: string;
    IdNo:string;
    Firstname:string;
    Middlename:string;
    Lastname:string;
    Suffix:string;
    DateofBirth:string;
    BirthPlace:string;
    Age:string;
    BloodType:string;
    Gender:string;
    CivilStatus:string;
    Address:string;
    HomeAddress:string;
    PhoneNo:string;
    Email:string;
    Position:string;
    Department:string;
    BranchCode:string;
    EmploymentStatus: string;
}


export interface EmployeeResponse {
  data: EmployeeList[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
