import { Request, Response } from "express";
import { ComputePayroll, fetchEmployeesByPayrollCycle, InitializeComputePayroll, InitializeEmployeesbyCycle, searchEmployees, updateEmployeePayrollFields, updateEmployeeSalary, ViewDeduction } from "./prepare_payroll.service";




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