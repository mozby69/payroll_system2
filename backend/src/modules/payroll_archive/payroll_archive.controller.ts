import { displayCompletePayroll, saveComputedPayroll } from "./payroll_archive.service";
import { Request,Response } from "express";





export const displayCompletePayrollController = async (req: Request, res: Response) => {
  try{
  

    const data = await displayCompletePayroll();

    return res.status(200).json({ status: "SUCCESS",data });
  }
  catch(error){
    res.status(500).json({message:`SERVER ERROR: ${error}`})
  }
}


export async function savePayrollController(req: Request, res: Response) {
  try {
    const result = await saveComputedPayroll();
    return res.json({ success: true, count: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save payroll" });
  }
}
