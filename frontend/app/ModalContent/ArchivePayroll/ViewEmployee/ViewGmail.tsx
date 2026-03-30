import { EmployeeArchivedType } from "@/app/types/totalPayroll";




 interface ViewEmployeeListProps {
    employee: EmployeeArchivedType;
  }


export default function EmployeeGmail({employee}:ViewEmployeeListProps){

    return(
        <>

            <h2> employe gmail:{employee.gmail_account}</h2>
        
        </>
    );
}