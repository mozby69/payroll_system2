
import { Request, Response } from "express";
import { CompleteVariance, FetchEmployeeVariance, fetchVariance } from "./variance.service";



export async function fetchVarianceController(req: Request, res: Response) {
  try {
    const company_id = req.query.company_id as string | undefined;
    const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;

    if (!cycle) {
      return res.status(400).json({ message: "cycle is required" });
    }

    if (!company_id) {
      return res.status(400).json({
        message: "company_id is required",
      });
    }

     if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];

    const userAcc = roles[0];

    const data = await fetchVariance(company_id,cycle,userAcc);
    return res.status(200).json({data});

  } catch (error) {
    console.error(`error occurred ${error}`);
    return res.status(500).json({
      message: "Failed to fetch variance",
    });
  }
}





export async function FetchEmployeeVarianceController(req:Request, res:Response){
  try{
   const company_id = req.query.company_id as string | undefined;
    const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;

    if (!cycle) {
      return res.status(400).json({ message: "cycle is required" });
    }

    if (!company_id) {
      return res.status(400).json({
        message: "company_id is required",
      });
    }

      if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];

    const userAcc = roles[0];

    const data = await FetchEmployeeVariance(company_id,cycle,userAcc);
    return res.status(200).json({data});
  }
  catch(error){
    console.error(`error occured ${error}`);
    return res.status(500).json({message:`error occured ${error}`})
  }
}






export async function CompleteVarianceController(req:Request, res:Response){
  try{
   const company_id = req.query.company_id as string | undefined;
    const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;

    if (!cycle) {
      return res.status(400).json({ message: "cycle is required" });
    }

    if (!company_id) {
      return res.status(400).json({
        message: "company_id is required",
      });
    }

      if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];

    const userAcc = roles[0];

    const data = await CompleteVariance(company_id,cycle,userAcc);
    return res.status(200).json(data);
  }
  catch(error){
    console.error(`error occured ${error}`);
    return res.status(500).json({message:`error occured ${error}`})
  }
}
