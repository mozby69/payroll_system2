import { EmployeeSummaryTypes, PaySlipTypes } from "./preparePayroll";

export const dummySummary: EmployeeSummaryTypes[] = [
    { 
       employee: "John Doe",
       basicPay: 7679.00,
        overtime: 5.5, 
        late: 2, 
        absence: 20, 
        total: 20, 
        wTax: 20, 
        sss: 20, 
        philHealth: 20, 
        pagIbig: 20, 
        arE: 20, 
        fch: 20, 
        salary: 20, 
        calamity: 20, 
        pagSalaryLoan: 20, 
        netPayable: 20, 
        sssEmpShare: 20, 
        philEmpShare: 20, 
        pagEmpShare: 20, 
       },
       { 
         employee: "John Doe",
         basicPay: 7679.00,
          overtime: 5.5, 
          late: 2, 
          absence: 20, 
          total: 20, 
          wTax: 20, 
          sss: 20, 
          philHealth: 20, 
          pagIbig: 20, 
          arE: 20, 
          fch: 20, 
          salary: 20, 
          calamity: 20, 
          pagSalaryLoan: 20, 
          netPayable: 20, 
          sssEmpShare: 20, 
          philEmpShare: 20, 
          pagEmpShare: 20, 
         },
    ];




    // Paylsip 


    const createPaySlip = (
        data: Omit<PaySlipTypes, "grossPay" | "totalDeduction" | "netPayable">
      ): PaySlipTypes => {
        const grossPay =
          data.basicPay + data.overTime - data.late - data.absence
      
        const totalDeduction =
          data.sss +
          data.withTax +
          data.pagIbig +
          data.arE +
          data.fchLoan +
          data.philHealth +
          data.pagIbigLoan +
          data.sssSalaryLoan +
          data.sssCalamityLoan +
          data.housingLoan
      
        const netPayable = grossPay - totalDeduction
      
        return {
          ...data,
          grossPay,
          totalDeduction,
          netPayable,
        }
      }
      
      
    export  const paySlipDummyData: PaySlipTypes[] = [
        createPaySlip({
          employeeCode: "EMP-001",
          name: "Juan Dela Cruz",
          payrollPeriod: "Jan 01–15, 2026",
          basicPay: 15000,
          overTime: 1250,
          late: 150,
          absence: 0,
          sss: 600,
          withTax: 750,
          pagIbig: 200,
          arE: 100,
          fchLoan: 0,
          philHealth: 400,
          pagIbigLoan: 0,
          sssSalaryLoan: 300,
          sssCalamityLoan: 0,
          housingLoan: 0,
        }),
        createPaySlip({
          employeeCode: "EMP-002",
          name: "Maria Santos",
          payrollPeriod: "Jan 01–15, 2026",
          basicPay: 18500,
          overTime: 2100,
          late: 0,
          absence: 0,
          sss: 700,
          withTax: 1100,
          pagIbig: 200,
          arE: 0,
          fchLoan: 500,
          philHealth: 450,
          pagIbigLoan: 300,
          sssSalaryLoan: 0,
          sssCalamityLoan: 0,
          housingLoan: 0,
        }),
        createPaySlip({
          employeeCode: "EMP-003",
          name: "Carlos Reyes",
          payrollPeriod: "Jan 01–15, 2026",
          basicPay: 12000,
          overTime: 800,
          late: 300,
          absence: 500,
          sss: 500,
          withTax: 400,
          pagIbig: 200,
          arE: 150,
          fchLoan: 0,
          philHealth: 350,
          pagIbigLoan: 0,
          sssSalaryLoan: 200,
          sssCalamityLoan: 100,
          housingLoan: 0,
        }),
        createPaySlip({
            employeeCode: "EMP-004",
            name: "Carlos Reyes",
            payrollPeriod: "Jan 01–15, 2026",
            basicPay: 12000,
            overTime: 800,
            late: 300,
            absence: 500,
            sss: 500,
            withTax: 400,
            pagIbig: 200,
            arE: 150,
            fchLoan: 0,
            philHealth: 350,
            pagIbigLoan: 0,
            sssSalaryLoan: 200,
            sssCalamityLoan: 100,
            housingLoan: 0,
          }),
          
      ]