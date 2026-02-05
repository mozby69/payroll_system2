import { Request, Response } from "express";
import { getCompanyDetailsServices } from "./general.services";

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