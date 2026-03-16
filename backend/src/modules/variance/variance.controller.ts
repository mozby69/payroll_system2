import {  fetchEmployeeVariance, fetchVariance, fetchVarianceEmp } from "./variance.service";
import { Request, Response } from "express";



export async function fetchVarianceController(req: Request, res: Response) {
  try {

    const company_id = req.query.company_id as string;

    const result = await fetchVariance(company_id);

    return res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch variance" });
  }
}


export async function fetchEmployeeVarianceController(req:Request, res:Response){
  try{

    const data = await fetchEmployeeVariance();
    return res.status(200).json(data);
  }
  catch(error){
    console.error("error occured in controller",error);
    res.status(500).json({message:"failed to save payroll"});
  }
} 



export async function fetchVarianceControllerEmp(req: Request, res: Response) {
  try {

    const companyId = req.query.company_id as string;

    if (!companyId) {
      return res.status(400).json({
        message: "company_id is required"
      });
    }

    const result = await fetchVarianceEmp(companyId);

    return res.json(result);

  } catch (error) {

    console.error("Variance Controller Error:", error);

    return res.status(500).json({
      message: "Failed to fetch variance"
    });

  }
}