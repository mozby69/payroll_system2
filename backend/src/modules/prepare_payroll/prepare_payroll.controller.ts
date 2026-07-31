import { Request, Response } from "express";
import { ComputePayroll, fetchEmployeesByPayrollCycle, InitializeComputePayroll, InitializeEmployeesbyCycle, searchEmployees, SummaryOverrideChanges, updateDeductionService, updateEmployeePayrollFields, updateEmployeeSalary, ViewDeduction } from "./prepare_payroll.service";




export const getEmployeesByCycle = async (req: Request,res: Response) => {
  const company_id = req.query.company_id as string;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

  const onlyNew = typeof req.query.onlyNew === "string" ? req.query.onlyNew === "true" : undefined;
  const onlyMissingSetup  = typeof req.query.onlyMissingSetup  === "string" ? req.query.onlyMissingSetup  === "true" : undefined;

 

  const result = await fetchEmployeesByPayrollCycle({
    company_id,
    page,
    limit,
    search,
    onlyNew,
    onlyMissingSetup
  });

  res.json(result);
};





export const saveEmployeePayrollController = async (req: Request,res: Response) => {
  try {
    const {empCode,basic_salary,old_salary,cash_assistance,pagibig_employee_share,remarks,include_payroll} = req.body;

    if (!empCode) {
      return res.status(400).json({ message: "empCode is required" });
    }

    //startget user
     if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      })
    }
    const approvedBy = req.user.username
    //end get user


    if (
      basic_salary !== undefined &&
      old_salary !== undefined &&
      Number(basic_salary) !== Number(old_salary)
    ) {

      if (!remarks || !remarks.trim()) {
        return res.status(400).json({ message: "Remarks is required when changing salary"});
      }

      await updateEmployeeSalary({
        empCode,
        old_salary: Number(old_salary),
        new_salary: Number(basic_salary),
        cash_assistance: Number(cash_assistance ?? 0),
        remarks,
        changed_by: approvedBy ?? "SYSTEM",
      });
    }

    await updateEmployeePayrollFields({
      empCode,
      basic_salary:basic_salary !== undefined ? Number(basic_salary) : undefined,
      pagibig_employee_share:pagibig_employee_share !== undefined ? Number(pagibig_employee_share): undefined,
      include_payroll,
      });

    return res.json({ message: "Payroll saved successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};





export const searchEmployeeController = async (req: Request, res: Response) => {
  const q = req.query.q?.toString() ?? "";
  const data = await searchEmployees(q);
  res.json(data);
};





export const getComputedPayrollController = async (req: Request,res: Response) => {
  const company_id = req.query.company_id as string;



  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;



  const result = await ComputePayroll({
    company_id,
    page,
    limit,
    search,
  });

  res.json(result);
};




export const InitializeComputePayrollController = async (req: Request,res: Response) => {
  const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

  if (!cycle) {
    return res.status(400).json({ message: "cycle is required" });
  }

  const result = await InitializeComputePayroll({
    cycle,
    page,
    limit,
    search,
  });

  res.json(result);
};






// initialize payroll


export const InitializeEmployeesbyCycleController = async (req: Request,res: Response) => {
  const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

  const onlyNew =
    typeof req.query.onlyNew === "string"
      ? req.query.onlyNew === "true"
      : undefined;
  const onlyMissingSetup  = 
    typeof req.query.onlyMissingSetup  === "string"
      ? req.query.onlyMissingSetup  === "true"
      :undefined;

  if (!cycle) {
    return res.status(400).json({ message: "cycle is required" });
  }

  const result = await InitializeEmployeesbyCycle({
    cycle,
    page,
    limit,
    search,
    onlyNew,
    onlyMissingSetup
  });

  res.json(result);
};



export const ViewDeductionController = async (req:Request, res:Response) => {
  try{
    const company_id = req.query.company_id as string;
    
    if(!company_id){
      return res.status(400).json({message:"company required"});
    }
      
    const data = await ViewDeduction(company_id);
    return res.status(200).json(data);
  }
  catch(error){
    return res.status(500).json({message:`Error occured ${error}`});
  }
}





type UpdateDeductionRequestBody = {
  PayCode?: string;
  EmpCodeId?: string;
  PayrollPeriod?: string;
  changes?: SummaryOverrideChanges;
};

export async function updateDeductionController(req: Request<Record<string, never>,unknown,UpdateDeductionRequestBody>,res: Response) {
  try {
    const {
      PayCode,
      EmpCodeId,
      PayrollPeriod,
      changes,
    } = req.body;

    if (
      !PayCode?.trim() ||
      !EmpCodeId?.trim() ||
      !PayrollPeriod?.trim()
    ) {
      return res.status(400).json({
        message:
          "PayCode, EmpCodeId, and PayrollPeriod are required",
      });
    }

    if (
      !changes ||
      typeof changes !== "object" ||
      Array.isArray(changes)
    ) {
      return res.status(400).json({
        message: "Changes object is required",
      });
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({
        message: "At least one field must be changed",
      });
    }

    const allowedFields: Array<
      keyof SummaryOverrideChanges
    > = [
      "LateCount",
      "TotalAbsentHours",
      "TotalUndertime",
      "TotalOvertime",
      "philhealth_employee",
      "philhealth_employer",
      "final_wtax",
      "basic_salary",
    ];

    const hasInvalidField = Object.keys(changes).some(
      (field) =>
        !allowedFields.includes(
          field as keyof SummaryOverrideChanges
        )
    );

    if (hasInvalidField) {
      return res.status(400).json({
        message: "Changes contain an invalid field",
      });
    }

    const hasInvalidValue = Object.entries(changes).some(
      ([, value]) =>
        typeof value !== "number" ||
        !Number.isFinite(value)
    );

    if (hasInvalidValue) {
      return res.status(400).json({
        message:
          "All override values must be valid numbers",
      });
    }

    const result = await updateDeductionService({
      PayCode: PayCode.trim(),
      EmpCodeId: EmpCodeId.trim(),
      PayrollPeriod: PayrollPeriod.trim(),
      changes,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "Error updating deduction override:",
      error
    );

    return res.status(500).json({
      message: "Failed to update deduction",
    });
  }
}


