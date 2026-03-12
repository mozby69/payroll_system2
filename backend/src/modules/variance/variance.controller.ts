import {  fetchEmployeeVariance, fetchVariance } from "./variance.service";
import { Request, Response } from "express";




export async function fetchVarianceController(req: Request, res: Response) {
    try {

      const result = await fetchVariance();

      return res.json(  result  );
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to save payroll" });
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