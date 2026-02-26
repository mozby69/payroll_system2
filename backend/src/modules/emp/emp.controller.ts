import { Request, Response } from "express";
import * as employeeService from "./emp.services";

const normalizeArray = (value: unknown): string[] | undefined => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return [String(value)];
};

export const getEmployees = async (req: Request, res: Response) => {
  try {

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const search = String(req.query.search ?? "");

    const department = normalizeArray(req.query["department[]"]);
    const company = normalizeArray(req.query["company[]"]);
    const status = normalizeArray(req.query["status[]"]);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      employeeService.getAllEmployees({
        skip,
        take: limit,
        search,
        department,
        company,
        status,
      }),
      employeeService.countEmployees({
        search,
        department,
        company,
        status,
      }),
    ]);

    return res.json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};



export const getEmployeeByEmpCode = async (
  req: Request,
  res: Response
) => {
  try {
    const { empCode } = req.params;

    const employee = await employeeService.getEmployeeByEmpCode(empCode);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch employee" });
  }
};

export const updateEmployeePayrollByEmpCode = async (req:Request, res:Response) =>{
    try{
        const {empCode} = req.params;
        const {basicSalary,cashAssistance,ecola,pagibigEmployeeShare} = req.body;

        if (!empCode){
          return res.status(400).json({message: "Employee code is required" });
        }

        const updated = await employeeService.updateEmployeePayroll(
          empCode,
          {
            basicSalary: Number(basicSalary),
            cashAssistance: Number(cashAssistance),
            ecola: Number(ecola),
            pagibigEmployeeShare: Number(pagibigEmployeeShare)
          }
        );

        return res.json(updated);

    }catch(err){
      console.error(err);
      res.status(500).json({ message: "Failed to update payroll" });
    }
}