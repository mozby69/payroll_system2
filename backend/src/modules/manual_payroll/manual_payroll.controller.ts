import { createPayrollService, DisplayManualPayroll, ExistingPaycode } from "./manual_payroll.service";
import { Request,Response } from "express";





export const ExistingPaycodeController = async (req: Request, res: Response) => {
  try{

    const data = await ExistingPaycode();
    return res.status(200).json(data);
  }
  catch(error){
    res.status(500).json({message:`SERVER ERROR: ${error}`})
  }
}


export async function createPayrollController(req: Request,res: Response) {
  try {

    const {
      selectedMonth,
      selectedRange,
      cycleCategory,
      payrollPeriod,
      fromDate,
      toDate,
      companyCode,
    } = req.body;

    const data = await createPayrollService({
      selectedMonth,
      selectedRange,
      cycleCategory,
      payrollPeriod,
      fromDate,
      toDate,
      companyCode,
    });

    res.status(200).json({success: true, data});

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create payroll",
    });
  }
}


export async function DisplayManualPayrollController(req:Request, res:Response){
  try{
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    
        const data = await DisplayManualPayroll({page,limit,search});
    
        return res.status(200).json(data);
      }
      catch(error){
        res.status(500).json({message:`SERVER ERROR: ${error}`})
      }
}