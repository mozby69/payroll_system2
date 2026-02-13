import {  displayCompletePayroll, employeeProbationary, reCheckPayroll, saveComputedFinalPayroll, saveComputedPayroll } from "./payroll_archive.service";
import { Request,Response } from "express";





export const displayCompletePayrollController = async (req: Request, res: Response) => {
  try{
    const res1 = await displayCompletePayroll(['PENDING']);
    const res2 = await employeeProbationary();
    return res.status(200).json({ status: "SUCCESS", data:res1, xxx:res2 });
  }
  catch(error){
    res.status(500).json({message:`SERVER ERROR: ${error}`})
  }
}


export async function savePayrollController(req: Request, res: Response) {
  try {
    const result = await saveComputedPayroll();
    return res.json({ success: true, res: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save payroll" });
  }
}


 
export async function saveComputedFinalPayrollController(req:Request, res:Response){
  try{
    const result = await saveComputedFinalPayroll();
    return res.json({ success: true, res: result })
  }
  catch(error){
    console.error("error",error);
    res.status(500).json({message:"failed to save final payroll"})
  }
}



export const displayForApprovalController = async (req: Request, res: Response) => {
  try{
  

    const data = await displayCompletePayroll(['FOR_APPROVAL']);

    return res.status(200).json({ status: "SUCCESS",data });
  }
  catch(error){
    res.status(500).json({message:`SERVER ERROR: ${error}`})
  }
}



export async function reCheckPayrollController(req: Request, res: Response) {
  try {
    const result = await reCheckPayroll();
    return res.json({ success: true, res: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save payroll" });
  }
}
