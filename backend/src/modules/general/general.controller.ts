import { Request, Response } from "express";
import { getCompaniesByCode, getCompaniesByCycle, getCompanyDetailsServices } from "./general.services";
import { string } from "zod";

export async function getCompanyDetailsController(
   req: Request,
   res: Response
) {
    try{
        const companyDetails = await getCompanyDetailsServices()
        return res.status(200).json(companyDetails)
    }catch(error){
        console.error(error)
        return res.status(500).json({
            message: "Failed to company details"
        })
    }
}





export async function getCompaniesByCycleController(req: Request, res: Response) {
    try {
      const { cycle }  = req.query;
  
      if(!cycle || typeof cycle !== "string"){
          return res.status(400).json({message:"cycle is required"});
      }
  
      const result = await getCompaniesByCycle(cycle);
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  }


  
export async function getCompaniesByCodeController(req: Request, res: Response) {
    try {
      const CompanyCode = req.params.CompanyCode
      if(!CompanyCode || typeof CompanyCode !== "string"){
          return res.status(400).json({message:"code is required"});
      }
      const result = await getCompaniesByCode(CompanyCode);
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  }