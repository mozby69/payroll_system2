import getAttendanceCount, { conversionReport, saveConversionArchive, updateVacationLeave } from "./conversion.service";
import { Request,Response } from "express";




export const getAttendanceCountController = async (req: Request, res: Response) => {
  try {

     const page = Math.max(Number(req.query.page) || 1, 1);
     const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
     const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
     const company_id = req.query.company_id as string;
     const result = await getAttendanceCount({page,limit,search,company_id});

    return res.status(200).json(result);
  } catch (error) {
    console.error("FETCH DATA ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch data",
    });
  }
};


export const updateVacationLeaveController = async (req: Request, res:Response) => {
  try{
    const id = Number(req.params.id);
    const updated = await updateVacationLeave(id, req.body);
    return res.status(200).json(updated);
  }
  catch(error){
    return res.status(500).json({ message: `SERVER ERROR ${error}`})
  }
}


export const conversionReportController = async (req:Request, res:Response) => {
  try{
    const company_id = req.query.company_id as string;
    if(!company_id ){
        return res.status(500).json('company id is required')
    }
    const data = await conversionReport({company_id});
    return res.status(200).json(data);
  }
  catch(error){
    return res.status(500).json({message:`server error ${error}`})
  }
}







export const saveConversionArchiveController = async (req: Request, res: Response) => {
  try {
    const company_id = req.query.company_id as string;

    if (!company_id) {
      return res.status(400).json({ message: "company_id is required" });
    }

    const result = await saveConversionArchive({ company_id });

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Conversion_Exists") {
      return res.status(409).json({
        message: "Conversion for this year has already been saved.",
      });
    }

    console.error("SAVE ALLOWANCE ERROR:", error);
    return res.status(500).json({
      message: "Failed to save allowance",
    });
  }
};