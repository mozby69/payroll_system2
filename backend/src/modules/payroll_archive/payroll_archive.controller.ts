import {  displayCompletePayroll, getEmployeeArchivedService, getTotalPayrollService, reCheckPayroll, saveComputedFinalPayroll, saveComputedPayroll } from "./payroll_archive.service";
import { Request,Response } from "express";





export const displayCompletePayrollController = async (req: Request, res: Response) => {
  try{
  

    const data = await displayCompletePayroll(['PENDING']);

    return res.status(200).json({ status: "SUCCESS",data });
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


export async function getTotalPayrollController(
  req: Request,
  res: Response
) {
  try {
    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 10
    const search = req.query.search as string | undefined
    const payCycle = req.query.payCycle as string | undefined

    const payroll = await getTotalPayrollService({
      page,
      pageSize,
      search,
      payCycle,
    })

    return res.status(200).json(payroll)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch total payroll",
    })
  }
}


export async function getEmployeeArchivedController(
  req: Request,
  res: Response
) {
  try{
      const page = Number(req.query.page) || 1
      const pageSize = Number(req.query.pageSize) || 10
      const search = req.query.search as string | undefined

      const archived = await getEmployeeArchivedService({
        page,
        pageSize,
        search
      })

      return res.status(200).json(archived)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch employee archived",
    })
  }

}