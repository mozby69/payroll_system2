import { Request, Response } from "express";
import { savePayrollToArchive } from "./prepare_payroll.service";




export const savePayrollToArchiveController = async(req:Request, res:Response):Promise<void> => {
  try{
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1),100);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const payCode = typeof req.query.payCode === "string" ? req.query.payCode : undefined;

    const result = await savePayrollToArchive({page,limit,search,payCode});
    res.status(200).json(result);
  }
  catch(error){
    console.error("error occured in controller");
    res.status(500).json({message:'error occured in controller'});
  }
}










